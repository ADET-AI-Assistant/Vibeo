import { describe, it, expect, vi } from 'vitest';
import { normalizeKeyEvent, TV_ACTIONS, registerTizenKeys } from '../utils/remoteKeyMapper';

describe('remoteKeyMapper', () => {
    describe('Standard Keyboard Events', () => {
        it('maps directional arrow keys', () => {
            expect(normalizeKeyEvent({ key: 'ArrowUp' })).toBe(TV_ACTIONS.UP);
            expect(normalizeKeyEvent({ key: 'ArrowDown' })).toBe(TV_ACTIONS.DOWN);
            expect(normalizeKeyEvent({ key: 'ArrowLeft' })).toBe(TV_ACTIONS.LEFT);
            expect(normalizeKeyEvent({ key: 'ArrowRight' })).toBe(TV_ACTIONS.RIGHT);
        });

        it('maps selection keys (Enter and Space)', () => {
            expect(normalizeKeyEvent({ key: 'Enter' })).toBe(TV_ACTIONS.SELECT);
            expect(normalizeKeyEvent({ keyCode: 13 })).toBe(TV_ACTIONS.SELECT);
            expect(normalizeKeyEvent({ keyCode: 32 })).toBe(TV_ACTIONS.SELECT);
        });

        it('maps back/escape keys', () => {
            expect(normalizeKeyEvent({ key: 'Escape' })).toBe(TV_ACTIONS.BACK);
            expect(normalizeKeyEvent({ key: 'Backspace' })).toBe(TV_ACTIONS.BACK);
            expect(normalizeKeyEvent({ keyCode: 27 })).toBe(TV_ACTIONS.BACK);
        });
    });

    describe('Smart TV Hardware Key Codes', () => {
        it('maps Samsung Tizen TV return and media keys', () => {
            // Tizen VK_RETURN is 10009
            expect(normalizeKeyEvent({ keyCode: 10009 })).toBe(TV_ACTIONS.BACK);
            // Tizen VK_PLAY is 415
            expect(normalizeKeyEvent({ keyCode: 415 })).toBe(TV_ACTIONS.PLAY_PAUSE);
            // Tizen VK_PAUSE is 19
            expect(normalizeKeyEvent({ keyCode: 19 })).toBe(TV_ACTIONS.PLAY_PAUSE);
            // Tizen VK_FAST_FWD is 417
            expect(normalizeKeyEvent({ keyCode: 417 })).toBe(TV_ACTIONS.FAST_FORWARD);
            // Tizen VK_REWIND is 412
            expect(normalizeKeyEvent({ keyCode: 412 })).toBe(TV_ACTIONS.REWIND);
        });

        it('maps LG webOS TV back key', () => {
            // LG webOS VK_BACK is 461
            expect(normalizeKeyEvent({ keyCode: 461 })).toBe(TV_ACTIONS.BACK);
        });

        it('maps Android TV remote keycodes', () => {
            // KEYCODE_BACK is 4
            expect(normalizeKeyEvent({ keyCode: 4 })).toBe(TV_ACTIONS.BACK);
            // KEYCODE_DPAD_CENTER is 23
            expect(normalizeKeyEvent({ keyCode: 23 })).toBe(TV_ACTIONS.SELECT);
            // KEYCODE_MEDIA_PLAY_PAUSE is 85
            expect(normalizeKeyEvent({ keyCode: 85 })).toBe(TV_ACTIONS.PLAY_PAUSE);
            // KEYCODE_MEDIA_FAST_FORWARD is 90
            expect(normalizeKeyEvent({ keyCode: 90 })).toBe(TV_ACTIONS.FAST_FORWARD);
            // KEYCODE_MEDIA_REWIND is 89
            expect(normalizeKeyEvent({ keyCode: 89 })).toBe(TV_ACTIONS.REWIND);
        });

        it('maps remote color keys (Red, Green, Yellow, Blue)', () => {
            expect(normalizeKeyEvent({ keyCode: 403 })).toBe(TV_ACTIONS.RED);
            expect(normalizeKeyEvent({ keyCode: 404 })).toBe(TV_ACTIONS.GREEN);
            expect(normalizeKeyEvent({ keyCode: 405 })).toBe(TV_ACTIONS.YELLOW);
            expect(normalizeKeyEvent({ keyCode: 406 })).toBe(TV_ACTIONS.BLUE);
        });
    });

    describe('registerTizenKeys', () => {
        it('calls tizen.tvinputdevice.registerKey when available', () => {
            const registerKeyMock = vi.fn();
            window.tizen = {
                tvinputdevice: {
                    registerKey: registerKeyMock,
                },
            };

            registerTizenKeys();
            expect(registerKeyMock).toHaveBeenCalledWith('MediaPlayPause');
            expect(registerKeyMock).toHaveBeenCalledWith('ColorF0Red');

            delete window.tizen;
        });

        it('does not throw when tizen is undefined', () => {
            expect(() => registerTizenKeys()).not.toThrow();
        });
    });
});
