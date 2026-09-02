/**
 * TVFocusContext.jsx
 * ───────────────────────────────────────────────────────────
 * High-performance, zero-dependency Spatial Navigation Engine
 * built specifically for 10-foot TV and remote control browsing.
 *
 * Supports:
 *  - Directional navigation (Up / Down / Left / Right)
 *  - Zone switching (Sidebar ↔ Hero ↔ Content Rows ↔ OSD ↔ Keyboard)
 *  - Focus memory (remembers position when switching zones)
 *  - Auto-scrolling to keep focused items in optimal TV view
 *  - Audio feedback cues
 * ───────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { normalizeKeyEvent, TV_ACTIONS, registerTizenKeys } from '../utils/remoteKeyMapper';
import { useGamepad } from '../hooks/useGamepad';
import { tvAudio } from '../utils/tvAudio';

const TVFocusContext = createContext(null);

export const TVFocusProvider = ({ children }) => {
    const [focusedId, setFocusedId] = useState(null);
    const focusedIdRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('vibeo-tv-sound');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Registries
    const focusablesRef = useRef(new Map());
    const zonesRef = useRef(new Map()); // zoneId -> { type: 'horizontal'|'vertical'|'grid', items: [], columns: 1 }
    const zoneOrderRef = useRef([]);    // Array of zone IDs in vertical visual order (excluding sidebar)
    const zoneMemoryRef = useRef(new Map()); // zoneId -> lastFocusedId
    const lastContentZoneRef = useRef('hero');
    const backHandlersRef = useRef([]);

    // Keep audio manager in sync with state
    useEffect(() => {
        tvAudio.setEnabled(soundEnabled);
        localStorage.setItem('vibeo-tv-sound', JSON.stringify(soundEnabled));
    }, [soundEnabled]);

    // Register Tizen TV keys on mount
    useEffect(() => {
        registerTizenKeys();
    }, []);

    /**
     * Programmatically set focus to an element ID
     */
    const focusItem = useCallback((id, options = { playSound: true, scroll: true }) => {
        const item = focusablesRef.current.get(id);
        if (!item || item.disabled) return false;

        const prevId = focusedIdRef.current;
        if (prevId === id) return true;

        // Trigger blur on previous
        if (prevId) {
            const prev = focusablesRef.current.get(prevId);
            if (prev?.onBlur) prev.onBlur();
        }

        focusedIdRef.current = id;
        setFocusedId(id);

        // Trigger focus on new
        if (item.onFocus) item.onFocus();

        // Track zone memory
        zoneMemoryRef.current.set(item.zone, id);
        if (item.zone !== 'sidebar') {
            lastContentZoneRef.current = item.zone;
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }

        // Audio feedback
        if (options.playSound) {
            tvAudio.playFocusSound();
        }

        // Smooth Auto-scroll into center of TV view
        if (options.scroll && item.ref?.current) {
            try {
                item.ref.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
            } catch {
                // Ignore JSDOM / test errors
            }
        }

        return true;
    }, []);

    /**
     * Register a focusable item
     */
    const registerFocusable = useCallback((config) => {
        const { id, zone = 'default', ref, onSelect, onFocus, onBlur, up, down, left, right, disabled = false } = config;
        focusablesRef.current.set(id, { id, zone, ref, onSelect, onFocus, onBlur, up, down, left, right, disabled });

        // Add to zone
        const zoneData = zonesRef.current.get(zone) || { type: 'horizontal', items: [], columns: 1 };
        if (!zoneData.items.includes(id)) {
            zoneData.items.push(id);
            zonesRef.current.set(zone, zoneData);
        }

        // Auto-focus first item if nothing is focused yet
        if (!focusedIdRef.current) {
            focusItem(id, { playSound: false, scroll: false });
        }

        return () => {
            focusablesRef.current.delete(id);
            const z = zonesRef.current.get(zone);
            if (z) {
                z.items = z.items.filter(item => item !== id);
            }
        };
    }, [focusItem]);

    /**
     * Configure a zone's layout type and sequence
     */
    const setZoneConfig = useCallback((zoneId, config = {}) => {
        const existing = zonesRef.current.get(zoneId) || { items: [] };
        zonesRef.current.set(zoneId, {
            ...existing,
            ...config,
        });

        // Sidebar is navigated to via Left from row index 0, not in vertical sequence
        if (zoneId === 'sidebar') return;

        if (config.orderIndex !== undefined) {
            zoneOrderRef.current[config.orderIndex] = zoneId;
        } else if (!zoneOrderRef.current.includes(zoneId)) {
            zoneOrderRef.current.push(zoneId);
        }
    }, []);

    /**
     * Register a custom back-button handler (e.g. for modals or players)
     */
    const registerBackHandler = useCallback((handler) => {
        backHandlersRef.current.push(handler);
        return () => {
            backHandlersRef.current = backHandlersRef.current.filter(h => h !== handler);
        };
    }, []);

    /**
     * Navigate focus in a given direction
     */
    const moveFocus = useCallback((direction) => {
        const currentId = focusedIdRef.current;
        if (!currentId) {
            const firstId = focusablesRef.current.keys().next().value;
            if (firstId) focusItem(firstId);
            return;
        }

        const current = focusablesRef.current.get(currentId);
        if (!current) return;

        // 1. Check direct override
        const overrideKey = direction.toLowerCase();
        if (current[overrideKey]) {
            const targetId = current[overrideKey];
            if (focusablesRef.current.has(targetId)) {
                focusItem(targetId);
                return;
            }
        }

        const currentZoneId = current.zone;
        const currentZone = zonesRef.current.get(currentZoneId);
        if (!currentZone) return;

        const items = currentZone.items.filter(id => {
            const f = focusablesRef.current.get(id);
            return f && !f.disabled;
        });
        const currentIndex = items.indexOf(currentId);

        // ── Sidebar Navigation ──
        if (currentZoneId === 'sidebar') {
            if (direction === TV_ACTIONS.UP) {
                const prevId = items[Math.max(0, currentIndex - 1)];
                if (prevId) focusItem(prevId);
                return;
            }
            if (direction === TV_ACTIONS.DOWN) {
                const nextId = items[Math.min(items.length - 1, currentIndex + 1)];
                if (nextId) focusItem(nextId);
                return;
            }
            if (direction === TV_ACTIONS.RIGHT) {
                // Return from sidebar to main content
                const cleanOrder = zoneOrderRef.current.filter(Boolean);
                const targetZone = lastContentZoneRef.current || cleanOrder[0];
                const rememberedId = zoneMemoryRef.current.get(targetZone);
                const targetZoneData = zonesRef.current.get(targetZone);
                const targetId = rememberedId || targetZoneData?.items?.[0];
                if (targetId) focusItem(targetId);
                return;
            }
            return;
        }

        // ── Grid Navigation (e.g. Virtual Keyboard) ──
        if (currentZone.type === 'grid') {
            const cols = currentZone.columns || 6;
            let nextIdx = currentIndex;

            if (direction === TV_ACTIONS.LEFT) {
                if (currentIndex % cols === 0) {
                    // At left edge of grid: switch to sidebar!
                    const sidebarItems = zonesRef.current.get('sidebar')?.items || [];
                    const target = zoneMemoryRef.current.get('sidebar') || sidebarItems[0];
                    if (target) focusItem(target);
                    return;
                }
                nextIdx = currentIndex - 1;
            } else if (direction === TV_ACTIONS.RIGHT) {
                if ((currentIndex + 1) % cols === 0 || currentIndex === items.length - 1) {
                    // At right edge of grid: jump to search results if registered
                    const searchResults = zonesRef.current.get('search-results')?.items || [];
                    if (searchResults.length > 0) {
                        focusItem(searchResults[0]);
                        return;
                    }
                }
                nextIdx = Math.min(items.length - 1, currentIndex + 1);
            } else if (direction === TV_ACTIONS.UP) {
                nextIdx = currentIndex - cols;
                if (nextIdx < 0) {
                    const cleanOrder = zoneOrderRef.current.filter(Boolean);
                    const zoneIdx = cleanOrder.indexOf(currentZoneId);
                    if (zoneIdx > 0) {
                        const prevZone = cleanOrder[zoneIdx - 1];
                        const target = zoneMemoryRef.current.get(prevZone) || zonesRef.current.get(prevZone)?.items?.[0];
                        if (target) focusItem(target);
                        return;
                    }
                    return;
                }
            } else if (direction === TV_ACTIONS.DOWN) {
                nextIdx = currentIndex + cols;
                if (nextIdx >= items.length) {
                    const cleanOrder = zoneOrderRef.current.filter(Boolean);
                    const zoneIdx = cleanOrder.indexOf(currentZoneId);
                    if (zoneIdx < cleanOrder.length - 1) {
                        const nextZone = cleanOrder[zoneIdx + 1];
                        const target = zoneMemoryRef.current.get(nextZone) || zonesRef.current.get(nextZone)?.items?.[0];
                        if (target) focusItem(target);
                        return;
                    }
                    return;
                }
            }

            if (items[nextIdx]) {
                focusItem(items[nextIdx]);
            }
            return;
        }

        // ── Horizontal Row Navigation (Movie Rows) ──
        if (direction === TV_ACTIONS.LEFT) {
            if (currentIndex === 0) {
                // Navigate from first item to Sidebar!
                const sidebarItems = zonesRef.current.get('sidebar')?.items || [];
                const target = zoneMemoryRef.current.get('sidebar') || sidebarItems[0];
                if (target) focusItem(target);
                return;
            }
            const nextId = items[currentIndex - 1];
            if (nextId) focusItem(nextId);
            return;
        }

        if (direction === TV_ACTIONS.RIGHT) {
            const nextId = items[Math.min(items.length - 1, currentIndex + 1)];
            if (nextId) focusItem(nextId);
            return;
        }

        // ── Vertical Zone-to-Zone Navigation (Up / Down) ──
        const cleanOrder = zoneOrderRef.current.filter(Boolean);
        const currentZoneIdx = cleanOrder.indexOf(currentZoneId);

        if (direction === TV_ACTIONS.UP) {
            if (currentZoneIdx > 0) {
                const prevZoneId = cleanOrder[currentZoneIdx - 1];
                const prevZone = zonesRef.current.get(prevZoneId);
                const remembered = zoneMemoryRef.current.get(prevZoneId);
                // Return to remembered or match closest horizontal index
                const targetId = remembered || prevZone?.items?.[Math.min(currentIndex, (prevZone?.items?.length || 1) - 1)];
                if (targetId) focusItem(targetId);
                return;
            }
        }

        if (direction === TV_ACTIONS.DOWN) {
            if (currentZoneIdx < cleanOrder.length - 1) {
                const nextZoneId = cleanOrder[currentZoneIdx + 1];
                const nextZone = zonesRef.current.get(nextZoneId);
                const remembered = zoneMemoryRef.current.get(nextZoneId);
                // Return to remembered or match closest horizontal index
                const targetId = remembered || nextZone?.items?.[Math.min(currentIndex, (nextZone?.items?.length || 1) - 1)];
                if (targetId) focusItem(targetId);
                return;
            }
        }
    }, [focusItem]);

    /**
     * Trigger selection action on currently focused item
     */
    const triggerSelect = useCallback(() => {
        if (!focusedId) return;
        const item = focusablesRef.current.get(focusedId);
        if (!item || item.disabled) return;

        tvAudio.playSelectSound();

        if (item.onSelect) {
            item.onSelect(item.id);
        } else if (item.ref?.current) {
            item.ref.current.click();
        }
    }, [focusedId]);

    /**
     * Trigger back action
     */
    const triggerBack = useCallback(() => {
        tvAudio.playBackSound();

        // 1. Check custom back handlers (e.g. modals, player)
        if (backHandlersRef.current.length > 0) {
            const handler = backHandlersRef.current[backHandlersRef.current.length - 1];
            const handled = handler();
            if (handled) return;
        }

        // 2. If inside content, jump focus to sidebar
        const current = focusablesRef.current.get(focusedId);
        if (current && current.zone !== 'sidebar') {
            const sidebarItems = zonesRef.current.get('sidebar')?.items || [];
            const target = zoneMemoryRef.current.get('sidebar') || sidebarItems[0];
            if (target) {
                focusItem(target);
                return;
            }
        }

        // 3. If in browser history, navigate back
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        }
    }, [focusedId, focusItem]);

    /**
     * Global keydown handler
     */
    useEffect(() => {
        const handleKeyDown = (e) => {
            const action = normalizeKeyEvent(e);
            if (!action) return;

            // Don't swallow typing if the user is inside a standard HTML input (unless Esc/Back)
            const isNativeInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            if (isNativeInput && action !== TV_ACTIONS.BACK && action !== TV_ACTIONS.UP && action !== TV_ACTIONS.DOWN) {
                return;
            }

            e.preventDefault();

            switch (action) {
                case TV_ACTIONS.UP:
                case TV_ACTIONS.DOWN:
                case TV_ACTIONS.LEFT:
                case TV_ACTIONS.RIGHT:
                    moveFocus(action);
                    break;
                case TV_ACTIONS.SELECT:
                    triggerSelect();
                    break;
                case TV_ACTIONS.BACK:
                    triggerBack();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [moveFocus, triggerSelect, triggerBack]);

    // Gamepad controller integration
    const handleGamepadAction = useCallback((action) => {
        switch (action) {
            case TV_ACTIONS.UP:
            case TV_ACTIONS.DOWN:
            case TV_ACTIONS.LEFT:
            case TV_ACTIONS.RIGHT:
                moveFocus(action);
                break;
            case TV_ACTIONS.SELECT:
                triggerSelect();
                break;
            case TV_ACTIONS.BACK:
                triggerBack();
                break;
            default:
                break;
        }
    }, [moveFocus, triggerSelect, triggerBack]);

    useGamepad(handleGamepadAction);

    const value = {
        focusedId,
        focusItem,
        moveFocus,
        triggerSelect,
        triggerBack,
        registerFocusable,
        setZoneConfig,
        registerBackHandler,
        isSidebarOpen,
        setIsSidebarOpen,
        soundEnabled,
        setSoundEnabled,
    };

    return (
        <TVFocusContext.Provider value={value}>
            {children}
        </TVFocusContext.Provider>
    );
};

export const useTVFocus = () => {
    const context = useContext(TVFocusContext);
    if (!context) {
        throw new Error('useTVFocus must be used within a TVFocusProvider');
    }
    return context;
};

/**
 * Hook to make any React component focusable via TV remote
 */
export const useTVFocusable = ({
    id,
    zone = 'default',
    onSelect,
    onFocus,
    onBlur,
    up,
    down,
    left,
    right,
    disabled = false,
    autoFocus = false,
}) => {
    const ref = useRef(null);
    const { focusedId, focusItem, registerFocusable } = useTVFocus();
    const callbacksRef = useRef({ onSelect, onFocus, onBlur, up, down, left, right, disabled });
    callbacksRef.current = { onSelect, onFocus, onBlur, up, down, left, right, disabled };

    useEffect(() => {
        const unregister = registerFocusable({
            id,
            zone,
            ref,
            get onSelect() { return callbacksRef.current.onSelect; },
            get onFocus() { return callbacksRef.current.onFocus; },
            get onBlur() { return callbacksRef.current.onBlur; },
            get up() { return callbacksRef.current.up; },
            get down() { return callbacksRef.current.down; },
            get left() { return callbacksRef.current.left; },
            get right() { return callbacksRef.current.right; },
            get disabled() { return callbacksRef.current.disabled; },
        });

        if (autoFocus) {
            focusItem(id, { playSound: false, scroll: false });
        }

        return unregister;
    }, [id, zone, registerFocusable]); // Stable: only re-register if id or zone changes

    const isFocused = focusedId === id;

    return {
        ref,
        isFocused,
        focusSelf: () => focusItem(id),
    };
};
