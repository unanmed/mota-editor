import { EVENT_KEY_CODE_MAP, KeyCode, KeyCodeUtils } from './keyCodes';

export function extractKeyCode(e: KeyboardEvent): KeyCode {
    if (e.charCode) {
        // "keypress" events mostly
        const char = String.fromCharCode(e.charCode).toUpperCase();
        return KeyCodeUtils.fromString(char);
    }

    const keyCode = e.keyCode;

    // browser quirks
    if (keyCode === 3) {
        return KeyCode.PauseBreak;
    }

    // cross browser keycodes:
    return EVENT_KEY_CODE_MAP[keyCode] || KeyCode.Unknown;
}
