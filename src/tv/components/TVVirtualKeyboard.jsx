import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Delete, X, Search } from 'lucide-react';
import { useTVFocus, useTVFocusable } from '../context/TVFocusContext';

const KeyItem = ({ id, label, onClick, className = '', autoFocus = false }) => {
    const { ref, isFocused } = useTVFocusable({
        id,
        zone: 'virtual-keyboard',
        onSelect: onClick,
        autoFocus,
    });

    return (
        <button
            ref={ref}
            className={`tv-key tv-focusable ${className} ${isFocused ? 'tv-focused' : ''}`}
            onClick={onClick}
            data-testid={`key-${id}`}
        >
            {label}
        </button>
    );
};

export const TVVirtualKeyboard = ({ query = '', onQueryChange, onSearch }) => {
    const { setZoneConfig } = useTVFocus();
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const queryRef = useRef(query);
    queryRef.current = query;

    useEffect(() => {
        setZoneConfig('virtual-keyboard', {
            type: 'grid',
            columns: 6,
            orderIndex: 0,
        });

        const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
        setSpeechSupported(!!SpeechRec);
    }, [setZoneConfig]);

    const handleCharPress = (char) => {
        onQueryChange?.(queryRef.current + char);
    };

    const handleBackspace = () => {
        if (queryRef.current.length > 0) {
            onQueryChange?.(queryRef.current.slice(0, -1));
        }
    };

    const handleClear = () => {
        onQueryChange?.('');
    };

    const handleVoiceSearch = () => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) return;

        try {
            const recognition = new SpeechRec();
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = () => setIsListening(false);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    onQueryChange?.(transcript);
                    onSearch?.(transcript);
                }
            };

            recognition.start();
        } catch {
            setIsListening(false);
        }
    };

    const keys = [
        'A', 'B', 'C', 'D', 'E', 'F',
        'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P', 'Q', 'R',
        'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', '0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9',
    ];

    return (
        <div className="tv-keyboard-panel">
            {/* Search Query Display Screen */}
            <div className="tv-keyboard-display" data-testid="tv-search-query">
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Search size={22} color="var(--c-accent)" />
                    {query || <span style={{ opacity: 0.45 }}>Search movies & TV shows...</span>}
                </span>

                {speechSupported && (
                    <button
                        className="tv-btn"
                        style={{ padding: '8px 14px', fontSize: '0.9rem', background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                        onClick={handleVoiceSearch}
                        title="Voice Search"
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        <span>{isListening ? 'Listening...' : 'Voice'}</span>
                    </button>
                )}
            </div>

            {/* 2D Key Grid */}
            <div className="tv-keyboard-grid">
                {keys.map((char, index) => (
                    <KeyItem
                        key={char}
                        id={`key-${char}`}
                        label={char}
                        onClick={() => handleCharPress(char)}
                        autoFocus={index === 0}
                    />
                ))}

                {/* Function Keys Row */}
                <KeyItem
                    id="key-space"
                    label="SPACE ␣"
                    className="tv-key--span2"
                    onClick={() => handleCharPress(' ')}
                />
                <KeyItem
                    id="key-backspace"
                    label="DELETE ⌫"
                    className="tv-key--span2"
                    onClick={handleBackspace}
                />
                <KeyItem
                    id="key-clear"
                    label="CLEAR ✕"
                    className="tv-key--span2"
                    onClick={handleClear}
                />
            </div>
        </div>
    );
};

export default TVVirtualKeyboard;
