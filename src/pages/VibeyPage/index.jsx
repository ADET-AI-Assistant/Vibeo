/**
 * VibeyPage/index.jsx
 * ═══════════════════════════════════════════════════════════════
 * Dedicated full-page Vibey AI chat experience.
 * ChatGPT/Gemini-style: sidebar with chat history + main chat area.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sendVibeyMessage } from '@/api/vibeyAI';
import {
    getUserChats,
    createChat,
    updateChatMessages,
    renameChat,
    deleteChatById,
    autoTitleChat,
} from '@/api/vibeyChatService';
import Header from '@/components/layout/Header';
import {
    Sparkles, Send, Plus, MessageSquare, Trash2,
    Pencil, Check, X, Play, Eye, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import './styles.css';
import './Sidebar.css';
import './Chat.css';

const FALLBACK_POSTER = 'https://placehold.co/120x180/1a1a2e/6b6b8a?text=No+Poster';

const QUICK_PROMPTS = [
    { label: '🎲 Surprise me!', text: 'Surprise me with a random great movie I probably haven\'t seen!' },
    { label: '🚀 Trending sci-fi', text: 'What are the best trending sci-fi movies right now?' },
    { label: '😱 Top horror', text: 'Recommend me the scariest horror movies of all time' },
    { label: '💎 Hidden gems', text: 'Show me some hidden gem movies that most people haven\'t heard of' },
    { label: '😂 Feel-good', text: 'I need a feel-good movie to lift my mood' },
    { label: '🎬 90s classics', text: 'What are the must-watch classic movies from the 90s?' },
    { label: '🧠 Mind-benders', text: 'Recommend movies with mind-bending plot twists' },
    { label: '🍿 Date night', text: 'Suggest the perfect movie for a date night' },
];

/**
 * Group chats by date segments: Today, Yesterday, Previous 7 Days, Older
 */
const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);

    const groups = { today: [], yesterday: [], week: [], older: [] };

    chats.forEach(chat => {
        // Robust date normalization: Handle Firestore Timestamps, JS Strings, or Numbers
        let chatDate;
        if (chat.updatedAt?.toDate) {
            chatDate = chat.updatedAt.toDate();
        } else if (chat.updatedAt?.seconds) {
            chatDate = new Date(chat.updatedAt.seconds * 1000);
        } else {
            chatDate = new Date(chat.updatedAt || 0);
        }

        if (chatDate >= today) groups.today.push(chat);
        else if (chatDate >= yesterday) groups.yesterday.push(chat);
        else if (chatDate >= weekAgo) groups.week.push(chat);
        else groups.older.push(chat);
    });

    return groups;
};

const VibeyPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    // Sidebar state
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatsLoading, setChatsLoading] = useState(true);

    // Chat state
    const [messages, setMessages] = useState([]);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Rename state
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // ── Load chats on mount ──
    useEffect(() => {
        if (!uid) { setChatsLoading(false); return; }
        const load = async () => {
            setChatsLoading(true);
            const userChats = await getUserChats(uid);
            setChats(userChats);
            setChatsLoading(false);
        };
        load();
    }, [uid]);

    // ── Auto-scroll on new messages ──
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // ── Focus input when chat changes ──
    useEffect(() => {
        inputRef.current?.focus();
    }, [activeChatId]);

    // ── Select a chat ──
    const selectChat = useCallback((chat) => {
        setActiveChatId(chat.id);
        setMessages(chat.messages || []);
        // Rebuild conversation history (only role+content for the LLM)
        const history = (chat.messages || []).map(m => ({
            role: m.role,
            content: m.rawContent || m.content,
        }));
        setConversationHistory(history);
    }, []);

    // ── New chat ──
    const handleNewChat = useCallback(async () => {
        setActiveChatId(null);
        setMessages([]);
        setConversationHistory([]);
        setInput('');
    }, []);

    // ── Send a message ──
    const handleSend = useCallback(async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || isTyping) return;
        if (!uid) return;

        setInput('');

        // Add user message
        const userMsg = { role: 'user', content: trimmed, timestamp: Date.now() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        const newHistory = [...conversationHistory, { role: 'user', content: trimmed }];
        setConversationHistory(newHistory);

        // Create chat in Firestore if this is a new conversation
        let chatId = activeChatId;
        if (!chatId) {
            const title = autoTitleChat(trimmed);
            chatId = await createChat(uid, title);
            if (!chatId) return;
            setActiveChatId(chatId);
            setChats(prev => [{ id: chatId, title, messages: [], updatedAt: new Date() }, ...prev]);
        }

        setIsTyping(true);

        try {
            const response = await sendVibeyMessage(newHistory);

            const vibeyMsg = {
                role: 'assistant',
                content: response.text,
                rawContent: response.rawResponse || response.text,
                movies: response.movies || [],
                timestamp: Date.now(),
            };

            const updatedMessages = [...newMessages, vibeyMsg];
            setMessages(updatedMessages);
            setConversationHistory(prev => [
                ...prev,
                { role: 'assistant', content: response.rawResponse || response.text },
            ]);

            // Persist to Firestore (strip rawContent for storage efficiency)
            const storableMessages = updatedMessages.map(m => ({
                role: m.role,
                content: m.content,
                ...(m.rawContent ? { rawContent: m.rawContent } : {}),
                ...(m.movies?.length ? { movies: m.movies } : {}),
                timestamp: m.timestamp,
            }));

            // Auto-title ONLY on the first exchange (user message + assistant response)
            // This prevents overwriting manual renames on subsequent messages.
            let title = undefined;
            if (updatedMessages.length === 2) {
                const firstUserMsg = updatedMessages.find(m => m.role === 'user');
                title = firstUserMsg ? autoTitleChat(firstUserMsg.content) : undefined;
            }

            await updateChatMessages(uid, chatId, storableMessages, title);

            // Update sidebar title if it was generated
            if (title) {
                setChats(prev => prev.map(c => c.id === chatId ? { ...c, title, updatedAt: new Date() } : c));
            }
        } catch (err) {
            console.error('[VibeyPage] Send error:', err);
            const errorMsg = {
                role: 'assistant',
                content: 'Oops, something went wrong on my end. Try again! 😅',
                movies: [],
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping, messages, conversationHistory, activeChatId, uid]);

    // ── Delete chat ──
    const handleDeleteChat = useCallback(async (e, chatId) => {
        e.stopPropagation();
        if (!uid) return;
        await deleteChatById(uid, chatId);
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (activeChatId === chatId) {
            setActiveChatId(null);
            setMessages([]);
            setConversationHistory([]);
        }
    }, [uid, activeChatId]);

    // ── Rename chat ──
    const startRename = (e, chat) => {
        e.stopPropagation();
        setRenamingId(chat.id);
        setRenameValue(chat.title || '');
    };

    const confirmRename = async (e) => {
        e.stopPropagation();
        if (!uid || !renamingId || !renameValue.trim()) return;
        await renameChat(uid, renamingId, renameValue.trim());
        setChats(prev => prev.map(c => c.id === renamingId ? { ...c, title: renameValue.trim() } : c));
        setRenamingId(null);
    };

    const cancelRename = (e) => {
        e.stopPropagation();
        setRenamingId(null);
    };

    // ── Key handlers ──
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleRenameKeyDown = (e) => {
        if (e.key === 'Enter') confirmRename(e);
        if (e.key === 'Escape') cancelRename(e);
    };

    // Navigation
    const handleWatchClick = (movie, e) => {
        e.stopPropagation();
        navigate(`/play/${movie.id}?type=${movie.media_type || 'movie'}`);
    };
    const handleDetailsClick = (movie, e) => {
        e.stopPropagation();
        navigate(`/watch/${movie.id}`);
    };

    const grouped = groupChatsByDate(chats);

    // ── Not logged in ──
    if (!currentUser) {
        return (
            <div className="page-wrapper">
                <Header />
                <main className="vp-login-prompt fade-in-up">
                    <div className="vp-login-card">
                        <div className="vp-login-icon"><Sparkles size={40} /></div>
                        <h2>Sign in to chat with Vibey</h2>
                        <p>Vibey remembers your conversations and gives personalized recommendations. Sign in to get started!</p>
                    </div>
                </main>
            </div>
        );
    }

    const renderChatGroup = (label, chatList) => {
        if (chatList.length === 0) return null;
        return (
            <div className="vp-sidebar-group" key={label}>
                <div className="vp-sidebar-group-label">{label}</div>
                {chatList.map(chat => (
                    <div
                        key={chat.id}
                        className={`vp-sidebar-item ${activeChatId === chat.id ? 'vp-sidebar-item--active' : ''}`}
                        onClick={() => selectChat(chat)}
                    >
                        {renamingId === chat.id ? (
                            <div className="vp-sidebar-rename" onClick={e => e.stopPropagation()}>
                                <input
                                    className="vp-sidebar-rename-input"
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onKeyDown={handleRenameKeyDown}
                                    autoFocus
                                />
                                <button className="vp-sidebar-rename-btn" onClick={confirmRename}><Check size={14} /></button>
                                <button className="vp-sidebar-rename-btn" onClick={cancelRename}><X size={14} /></button>
                            </div>
                        ) : (
                            <>
                                <MessageSquare size={14} className="vp-sidebar-item-icon" />
                                <span className="vp-sidebar-item-title">{chat.title || 'Untitled'}</span>
                                <div className="vp-sidebar-item-actions">
                                    <button className="vp-sidebar-action" onClick={(e) => startRename(e, chat)} title="Rename"><Pencil size={13} /></button>
                                    <button className="vp-sidebar-action vp-sidebar-action--delete" onClick={(e) => handleDeleteChat(e, chat.id)} title="Delete"><Trash2 size={13} /></button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="page-wrapper">
            <Header />

            <div className="vp-layout">
                {/* ── Sidebar ── */}
                <aside className={`vp-sidebar ${sidebarOpen ? '' : 'vp-sidebar--collapsed'}`}>
                    <div className="vp-sidebar-header">
                        <button className="vp-new-chat-btn" onClick={handleNewChat}>
                            <Plus size={16} /> New Chat
                        </button>
                        <button className="vp-sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Close sidebar">
                            <PanelLeftClose size={18} />
                        </button>
                    </div>

                    <div className="vp-sidebar-list">
                        {chatsLoading ? (
                            <div className="vp-sidebar-loading">
                                <div className="spinner" style={{ width: 20, height: 20 }} />
                            </div>
                        ) : chats.length === 0 ? (
                            <div className="vp-sidebar-empty">
                                <p>No chats yet</p>
                            </div>
                        ) : (
                            <>
                                {renderChatGroup('Today', grouped.today)}
                                {renderChatGroup('Yesterday', grouped.yesterday)}
                                {renderChatGroup('Previous 7 Days', grouped.week)}
                                {renderChatGroup('Older', grouped.older)}
                            </>
                        )}
                    </div>
                </aside>

                {/* Sidebar toggle (when collapsed) */}
                {!sidebarOpen && (
                    <button className="vp-sidebar-open-btn" onClick={() => setSidebarOpen(true)} title="Open sidebar">
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                {/* ── Main Chat Area ── */}
                <main className="vp-main">
                    {/* Messages / Empty state */}
                    <div className="vp-messages-area">
                        {messages.length === 0 && !isTyping ? (
                            <div className="vp-empty-state fade-in-up">
                                <div className="vp-empty-icon"><Sparkles size={48} /></div>
                                <h2 className="vp-empty-title">What would you like to watch?</h2>
                                <p className="vp-empty-desc">
                                    Ask Vibey for movie recommendations, discover hidden gems, or tell me what mood you're in!
                                </p>
                                <div className="vp-empty-chips">
                                    {QUICK_PROMPTS.map((chip, i) => (
                                        <button
                                            key={i}
                                            className="vp-prompt-chip"
                                            onClick={() => handleSend(chip.text)}
                                            disabled={isTyping}
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="vp-messages">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`vp-msg ${msg.role === 'user' ? 'vp-msg--user' : 'vp-msg--assistant'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="vp-msg-avatar"><Sparkles size={14} /></div>
                                        )}
                                        <div className="vp-msg-content">
                                            <div className="vp-msg-bubble">{msg.content}</div>

                                            {msg.movies?.length > 0 && (
                                                <div className="vp-movie-cards">
                                                    {msg.movies.map((movie, j) => (
                                                        <div key={j} className="vp-movie-card">
                                                            <img
                                                                className="vp-movie-poster"
                                                                src={movie.posterUrl || FALLBACK_POSTER}
                                                                alt={movie.title}
                                                                loading="lazy"
                                                                onError={(e) => { e.target.src = FALLBACK_POSTER; }}
                                                            />
                                                            <div className="vp-movie-info">
                                                                <h5 className="vp-movie-title">{movie.title}</h5>
                                                                <div className="vp-movie-meta">
                                                                    {movie.vote_average > 0 && (
                                                                        <span className="vp-movie-rating">★ {Number(movie.vote_average).toFixed(1)}</span>
                                                                    )}
                                                                    {movie.release_date && (
                                                                        <span className="vp-movie-year">{movie.release_date.substring(0, 4)}</span>
                                                                    )}
                                                                </div>
                                                                {movie.overview && (
                                                                    <p className="vp-movie-overview">{movie.overview}</p>
                                                                )}
                                                                <div className="vp-movie-actions">
                                                                    <button className="vp-movie-btn vp-movie-btn--primary" onClick={(e) => handleWatchClick(movie, e)}>
                                                                        <Play size={12} /> Watch
                                                                    </button>
                                                                    <button className="vp-movie-btn vp-movie-btn--secondary" onClick={(e) => handleDetailsClick(movie, e)}>
                                                                        <Eye size={12} /> Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="vp-msg vp-msg--assistant">
                                        <div className="vp-msg-avatar"><Sparkles size={14} /></div>
                                        <div className="vp-msg-content">
                                            <div className="vp-typing">
                                                <span className="vp-typing-dot" />
                                                <span className="vp-typing-dot" />
                                                <span className="vp-typing-dot" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* ── Bottom Input Bar ── */}
                    <div className="vp-input-bar">
                        <div className="vp-input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                className="vp-input"
                                placeholder="Ask Vibey anything about movies..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isTyping}
                            />
                            <button
                                className="vp-send-btn"
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                aria-label="Send"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="vp-disclaimer">Vibey can make mistakes. Verify movie info on TMDB.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VibeyPage;
