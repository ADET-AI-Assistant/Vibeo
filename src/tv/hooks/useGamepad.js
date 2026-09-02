/**
 * useGamepad.js
 * ───────────────────────────────────────────────────────────
 * Hook to listen for Gamepad / Game Controller inputs (e.g.
 * Xbox, PlayStation, 8BitDo connected to PC / Smart TV) and
 * dispatch corresponding TV actions.
 * ───────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react';
import { TV_ACTIONS } from '../utils/remoteKeyMapper';

const DEBOUNCE_MS = 180;
const STICK_THRESHOLD = 0.55;

export const useGamepad = (onAction) => {
    const lastActionTime = useRef(0);
    const reqRef = useRef(null);

    useEffect(() => {
        let isRunning = true;

        const checkGamepad = () => {
            if (!isRunning) return;

            if (typeof navigator !== 'undefined' && navigator.getGamepads) {
                const gamepads = navigator.getGamepads();
                const gp = gamepads ? Array.from(gamepads).find(g => g !== null && g.connected) : null;

                if (gp) {
                    const now = Date.now();
                    if (now - lastActionTime.current > DEBOUNCE_MS) {
                        let action = null;

                        // ── D-Pad Buttons (Standard Gamepad Mapping) ──
                        const btnUp = gp.buttons[12]?.pressed;
                        const btnDown = gp.buttons[13]?.pressed;
                        const btnLeft = gp.buttons[14]?.pressed;
                        const btnRight = gp.buttons[15]?.pressed;

                        // ── Left Stick Axes ──
                        const axisX = gp.axes[0] || 0;
                        const axisY = gp.axes[1] || 0;

                        if (btnUp || axisY < -STICK_THRESHOLD) {
                            action = TV_ACTIONS.UP;
                        } else if (btnDown || axisY > STICK_THRESHOLD) {
                            action = TV_ACTIONS.DOWN;
                        } else if (btnLeft || axisX < -STICK_THRESHOLD) {
                            action = TV_ACTIONS.LEFT;
                        } else if (btnRight || axisX > STICK_THRESHOLD) {
                            action = TV_ACTIONS.RIGHT;
                        } else if (gp.buttons[0]?.pressed) { // 'A' on Xbox / 'X' on PS
                            action = TV_ACTIONS.SELECT;
                        } else if (gp.buttons[1]?.pressed) { // 'B' on Xbox / 'O' on PS
                            action = TV_ACTIONS.BACK;
                        } else if (gp.buttons[2]?.pressed) { // 'X' on Xbox / 'Square' on PS
                            action = TV_ACTIONS.PLAY_PAUSE;
                        } else if (gp.buttons[9]?.pressed) { // Start / Options
                            action = TV_ACTIONS.MENU;
                        }

                        if (action && onAction) {
                            lastActionTime.current = now;
                            onAction(action);
                        }
                    }
                }
            }

            reqRef.current = requestAnimationFrame(checkGamepad);
        };

        reqRef.current = requestAnimationFrame(checkGamepad);

        return () => {
            isRunning = false;
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [onAction]);
};
