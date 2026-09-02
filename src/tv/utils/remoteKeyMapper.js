/**
 * remoteKeyMapper.js
 * ───────────────────────────────────────────────────────────
 * Translates hardware remote control key codes and keyboard
 * events across various Smart TV platforms (Tizen, webOS,
 * Android TV, Fire TV, standard PC browsers) into normalized actions.
 * ───────────────────────────────────────────────────────────
 */

export const TV_ACTIONS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    SELECT: 'SELECT',
    BACK: 'BACK',
    PLAY_PAUSE: 'PLAY_PAUSE',
    FAST_FORWARD: 'FAST_FORWARD',
    REWIND: 'REWIND',
    RED: 'RED',
    GREEN: 'GREEN',
    YELLOW: 'YELLOW',
    BLUE: 'BLUE',
    MENU: 'MENU',
};

/**
 * Key code lookup table mapping platform-specific codes to normalized TV actions
 */
const KEYCODE_MAP = {
    // ── Directional Navigation ──
    38: TV_ACTIONS.UP,         // Standard ArrowUp / Android KEYCODE_DPAD_UP
    40: TV_ACTIONS.DOWN,       // Standard ArrowDown / Android KEYCODE_DPAD_DOWN
    37: TV_ACTIONS.LEFT,       // Standard ArrowLeft / Android KEYCODE_DPAD_LEFT
    39: TV_ACTIONS.RIGHT,      // Standard ArrowRight / Android KEYCODE_DPAD_RIGHT

    // ── Selection / Enter ──
    13: TV_ACTIONS.SELECT,     // Standard Enter
    32: TV_ACTIONS.SELECT,     // Space bar
    23: TV_ACTIONS.SELECT,     // Android KEYCODE_DPAD_CENTER

    // ── Back / Return ──
    27: TV_ACTIONS.BACK,       // Standard Escape
    8: TV_ACTIONS.BACK,        // Standard Backspace (when not in text input)
    4: TV_ACTIONS.BACK,        // Android KEYCODE_BACK
    461: TV_ACTIONS.BACK,      // LG webOS VK_BACK
    10009: TV_ACTIONS.BACK,    // Samsung Tizen RETURN

    // ── Media Play / Pause / Seek ──
    179: TV_ACTIONS.PLAY_PAUSE, // W3C MediaPlayPause
    85: TV_ACTIONS.PLAY_PAUSE,  // Android KEYCODE_MEDIA_PLAY_PAUSE
    126: TV_ACTIONS.PLAY_PAUSE, // Android KEYCODE_MEDIA_PLAY
    127: TV_ACTIONS.PLAY_PAUSE, // Android KEYCODE_MEDIA_PAUSE
    415: TV_ACTIONS.PLAY_PAUSE, // Tizen / webOS VK_PLAY
    19: TV_ACTIONS.PLAY_PAUSE,  // Tizen / webOS VK_PAUSE
    10252: TV_ACTIONS.PLAY_PAUSE,// Tizen VK_PLAY_PAUSE

    228: TV_ACTIONS.FAST_FORWARD, // W3C MediaFastForward
    90: TV_ACTIONS.FAST_FORWARD,  // Android KEYCODE_MEDIA_FAST_FORWARD
    417: TV_ACTIONS.FAST_FORWARD, // Tizen / webOS VK_FAST_FWD

    227: TV_ACTIONS.REWIND,       // W3C MediaRewind
    89: TV_ACTIONS.REWIND,        // Android KEYCODE_MEDIA_REWIND
    412: TV_ACTIONS.REWIND,       // Tizen / webOS VK_REWIND

    // ── Color keys ──
    403: TV_ACTIONS.RED,
    404: TV_ACTIONS.GREEN,
    405: TV_ACTIONS.YELLOW,
    406: TV_ACTIONS.BLUE,
};

/**
 * Key name lookup table using KeyboardEvent.key / code
 */
const KEY_NAME_MAP = {
    'ArrowUp': TV_ACTIONS.UP,
    'Up': TV_ACTIONS.UP,
    'ArrowDown': TV_ACTIONS.DOWN,
    'Down': TV_ACTIONS.DOWN,
    'ArrowLeft': TV_ACTIONS.LEFT,
    'Left': TV_ACTIONS.LEFT,
    'ArrowRight': TV_ACTIONS.RIGHT,
    'Right': TV_ACTIONS.RIGHT,
    'Enter': TV_ACTIONS.SELECT,
    'Select': TV_ACTIONS.SELECT,
    'Escape': TV_ACTIONS.BACK,
    'Backspace': TV_ACTIONS.BACK,
    'GoBack': TV_ACTIONS.BACK,
    'BrowserBack': TV_ACTIONS.BACK,
    'MediaPlayPause': TV_ACTIONS.PLAY_PAUSE,
    'MediaPlay': TV_ACTIONS.PLAY_PAUSE,
    'MediaPause': TV_ACTIONS.PLAY_PAUSE,
    'MediaFastForward': TV_ACTIONS.FAST_FORWARD,
    'MediaRewind': TV_ACTIONS.REWIND,
    'MediaTrackNext': TV_ACTIONS.FAST_FORWARD,
    'MediaTrackPrevious': TV_ACTIONS.REWIND,
};

/**
 * Normalizes any KeyboardEvent into a TV action, or null if unhandled.
 * @param {KeyboardEvent} event
 * @returns {string|null} TV_ACTIONS value or null
 */
export const normalizeKeyEvent = (event) => {
    if (!event) return null;

    // Check key name first (modern standard)
    if (event.key && KEY_NAME_MAP[event.key]) {
        return KEY_NAME_MAP[event.key];
    }

    // Fall back to keyCode / which
    const keyCode = event.keyCode || event.which;
    if (keyCode && KEYCODE_MAP[keyCode]) {
        return KEYCODE_MAP[keyCode];
    }

    return null;
};

/**
 * Registers Tizen platform keys if running on a Samsung TV
 */
export const registerTizenKeys = () => {
    try {
        if (typeof window !== 'undefined' && window.tizen && window.tizen.tvinputdevice) {
            const keysToRegister = [
                'MediaPlayPause', 'MediaPlay', 'MediaPause',
                'MediaFastForward', 'MediaRewind',
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
            ];
            keysToRegister.forEach(k => {
                try {
                    window.tizen.tvinputdevice.registerKey(k);
                } catch {
                    // Ignore unsupported keys
                }
            });
        }
    } catch {
        // Not a Tizen environment
    }
};
