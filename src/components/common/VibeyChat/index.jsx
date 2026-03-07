/**
 * VibeyChat/index.jsx
 * ═══════════════════════════════════════════════════════════════
 * Vibey — Vibeo's AI chatbot assistant.
 * Floating action button + slide-up chat panel.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { sendVibeyMessage } from '@/api/vibeyAI';
import { createChat, updateChatMessages, autoTitleChat } from '@/api/vibeyChatService';
import { Sparkles, Send, X, Play, Eye, MessageCircle, Maximize2 } from 'lucide-react';
import './styles.css';

const FALLBACK_POSTER = 'https://placehold.co/120x180/1a1a2e/6b6b8a?text=No+Poster';

const QUICK_PROMPTS = [
    { label: '🎲 Surprise me!', text: 'Surprise me with a random great movie I probably haven\'t seen!' },
    { label: '🚀 Trending sci-fi', text: 'What are the best trending sci-fi movies right now?' },
    { label: '😱 Top horror', text: 'Recommend me the scariest horror movies of all time' },
    { label: '💎 Hidden gems', text: 'Show me some hidden gem movies that most people haven\'t heard of' },
    { label: '😂 Feel-good', text: 'I need a feel-good movie to lift my mood' },
];

const VibeyChat = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    const [isOpen, setIsOpen] = useState(false);
    const [activeChatId, setActiveChatId] = useState(null);

    // Hide entirely on the dedicated /vibey page or the player page (/play/)
    const isOnVibeyPage = location.pathname === '/vibey';
    const isOnPlayerPage = location.pathname.startsWith('/play/');

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [isOpen]);

    const handleSend = useCallback(async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || isTyping) return;
        if (!uid) {
            // Fallback for non-logged in users: just UI-only chat
            // (Wait, actually VibeyPage requires login, but floating chat maybe not?)
            // For consistency with VibeyPage, we should probably encourage login, 
            // but let's at least keep UI working if not logged in.
        }

        // Clear input
        setInput('');

        // Add user message to UI
        const userMsg = { role: 'user', content: trimmed, timestamp: Date.now() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        // Update conversation history for context
        const newHistory = [...conversationHistory, { role: 'user', content: trimmed }];
        setConversationHistory(newHistory);

        // Firestore: Create chat if needed
        let chatId = activeChatId;
        if (uid && !chatId) {
            const title = autoTitleChat(trimmed);
            chatId = await createChat(uid, title);
            if (chatId) setActiveChatId(chatId);
        }

        // Show typing indicator
        setIsTyping(true);

        try {
            const response = await sendVibeyMessage(newHistory);

            // Add Vibey's response
            const vibeyMsg = {
                role: 'assistant',
                content: response.text,
                rawContent: response.rawResponse || response.text,
                movies: response.movies || [],
                timestamp: Date.now(),
            };

            const updatedMessages = [...newMessages, vibeyMsg];
            setMessages(updatedMessages);

            // Update conversation history with response
            setConversationHistory(prev => [
                ...prev,
                { role: 'assistant', content: response.rawResponse || response.text },
            ]);

            // Persist to Firestore if logged in
            if (uid && chatId) {
                const storableMessages = updatedMessages.map(m => ({
                    role: m.role,
                    content: m.content,
                    ...(m.rawContent ? { rawContent: m.rawContent } : {}),
                    ...(m.movies?.length ? { movies: m.movies } : {}),
                    timestamp: m.timestamp,
                }));

                // Auto-title on first exchange
                let title = undefined;
                if (updatedMessages.length === 2) {
                    title = autoTitleChat(trimmed);
                }

                await updateChatMessages(uid, chatId, storableMessages, title);
            }
        } catch (err) {
            console.error('[Vibey] Send error:', err);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Oops, something went wrong on my end. Try again! 😅',
                    movies: [],
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [input, isTyping, conversationHistory, messages, activeChatId, uid]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChipClick = (text) => {
        handleSend(text);
    };

    const togglePanel = () => {
        setIsOpen(prev => !prev);
    };

    const handleWatchClick = (movie, e) => {
        e.stopPropagation();
        const type = movie.media_type || 'movie';
        navigate(`/play/${movie.id}?type=${type}`);
    };

    const handleDetailsClick = (movie, e) => {
        e.stopPropagation();
        const type = movie.media_type || 'movie';
        navigate(`/watch/${movie.id}?type=${type}`);
    };

    if (isOnVibeyPage || isOnPlayerPage) return null;

    return (
        <div className="vibey-container">
            {/* ── Chat Panel ── */}
            <div className={`vibey-panel ${isOpen ? 'vibey-panel--open' : ''}`}>
                {/* Header */}
                <div className="vibey-header">
                    <div className="vibey-header__left">
                        <div className="vibey-avatar vibey-avatar--sm">
                            <Sparkles size={16} />
                        </div>
                        <div className="vibey-header__info">
                            <h3 className="vibey-header__name">Vibey</h3>
                            <span className="vibey-header__status">AI Movie Assistant</span>
                        </div>
                    </div>
                    <div className="vibey-header__right">
                        <button className="vibey-close" onClick={() => { setIsOpen(false); navigate('/vibey'); }} aria-label="Open full chat" title="Open full chat">
                            <Maximize2 size={16} />
                        </button>
                        <button className="vibey-close" onClick={togglePanel} aria-label="Close Vibey">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="vibey-messages">
                    {messages.length === 0 && !isTyping && (
                        <div className="vibey-welcome">
                            <div className="vibey-welcome__icon">
                                <Sparkles size={32} />
                            </div>
                            <h4 className="vibey-welcome__title">Hey there! I'm Vibey 👋</h4>
                            <p className="vibey-welcome__desc">
                                Your personal movie assistant. Ask me for recommendations, discover hidden gems, or tell me what you're in the mood for!
                            </p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`vibey-msg ${msg.role === 'user' ? 'vibey-msg--user' : 'vibey-msg--assistant'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="vibey-msg__avatar">
                                    <Sparkles size={12} />
                                </div>
                            )}
                            <div className="vibey-msg__content">
                                <div className="vibey-msg__bubble">
                                    {msg.content}
                                </div>

                                {/* Movie Recommendation Cards */}
                                {msg.movies && msg.movies.length > 0 && (
                                    <div className="vibey-cards">
                                        {msg.movies.map((movie, j) => (
                                            <div key={j} className="vibey-card">
                                                <img
                                                    className="vibey-card__poster"
                                                    src={movie.posterUrl || FALLBACK_POSTER}
                                                    alt={movie.title}
                                                    loading="lazy"
                                                    onError={(e) => { e.target.src = FALLBACK_POSTER; }}
                                                />
                                                <div className="vibey-card__info">
                                                    <h5 className="vibey-card__title">{movie.title}</h5>
                                                    <div className="vibey-card__meta">
                                                        {movie.vote_average > 0 && (
                                                            <span className="vibey-card__rating">
                                                                ★ {Number(movie.vote_average).toFixed(1)}
                                                            </span>
                                                        )}
                                                        {movie.release_date && (
                                                            <span className="vibey-card__year">
                                                                {movie.release_date.substring(0, 4)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="vibey-card__actions">
                                                        <button
                                                            className="vibey-card__btn vibey-card__btn--primary"
                                                            onClick={(e) => handleWatchClick(movie, e)}
                                                        >
                                                            <Play size={12} /> Watch
                                                        </button>
                                                        <button
                                                            className="vibey-card__btn vibey-card__btn--secondary"
                                                            onClick={(e) => handleDetailsClick(movie, e)}
                                                        >
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

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="vibey-msg vibey-msg--assistant">
                            <div className="vibey-msg__avatar">
                                <Sparkles size={12} />
                            </div>
                            <div className="vibey-msg__content">
                                <div className="vibey-typing">
                                    <span className="vibey-typing__dot" />
                                    <span className="vibey-typing__dot" />
                                    <span className="vibey-typing__dot" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompt Chips */}
                {messages.length === 0 && (
                    <div className="vibey-chips">
                        {QUICK_PROMPTS.map((chip, i) => (
                            <button
                                key={i}
                                className="vibey-chip"
                                onClick={() => handleChipClick(chip.text)}
                                disabled={isTyping}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="vibey-input-area">
                    <input
                        ref={inputRef}
                        type="text"
                        className="vibey-input"
                        placeholder="Ask Vibey anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                    />
                    <button
                        className="vibey-send"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* ── Floating Action Button ── */}
            <button
                className={`vibey-fab ${isOpen ? 'vibey-fab--active' : ''}`}
                onClick={togglePanel}
                aria-label="Open Vibey AI Assistant"
            >
                <div className="vibey-fab__icon">
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </div>
                <div className="vibey-fab__pulse" />
            </button>
        </div>
    );
};

export default VibeyChat;
