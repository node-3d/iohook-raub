import EventEmitter from 'node:events';
export type TEventNameKeyboard = 'keypress' | 'keydown' | 'keyup';
export type TEventNameMouse = 'mouseclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mousedrag';
export type TEventNameWheel = 'mousewheel';
export type TEventName = TEventNameKeyboard | TEventNameMouse | TEventNameWheel;
export type THookEventCommon = {
    mask: number;
    time: number;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
};
export type THookEventKeyboard = THookEventCommon & {
    type: TEventNameKeyboard;
    altKey: boolean;
    ctrlKey: boolean;
    keychar?: number;
    keycode: number;
    metaKey: boolean;
    rawcode: number;
    shiftKey: boolean;
};
export type THookEventMouse = THookEventCommon & {
    type: TEventNameMouse;
    button: number;
    clicks: number;
    x: number;
    y: number;
};
export type THookEventWheel = THookEventCommon & {
    type: TEventNameWheel;
    amount: number;
    clicks: number;
    direction: number;
    rotation: number;
    x: number;
    y: number;
};
export type THookEvent = THookEventKeyboard | THookEventMouse | THookEventWheel;
type TPossibleSubscriptions = {
    addListener(eventName: TEventNameKeyboard, listener: (event: THookEventKeyboard) => void): EventEmitter;
    addListener(eventName: TEventNameMouse, listener: (event: THookEventMouse) => void): EventEmitter;
    addListener(eventName: TEventNameWheel, listener: (event: THookEventWheel) => void): EventEmitter;
    on(eventName: TEventNameKeyboard, listener: (event: THookEventKeyboard) => void): EventEmitter;
    on(eventName: TEventNameMouse, listener: (event: THookEventMouse) => void): EventEmitter;
    on(eventName: TEventNameWheel, listener: (event: THookEventWheel) => void): EventEmitter;
    once(eventName: TEventNameKeyboard, listener: (event: THookEventKeyboard) => void): EventEmitter;
    once(eventName: TEventNameMouse, listener: (event: THookEventMouse) => void): EventEmitter;
    once(eventName: TEventNameWheel, listener: (event: THookEventWheel) => void): EventEmitter;
};
type TIoHookControls = {
    /**
     * Start the hook engine.
     *
     * If `enableLogger` is true, the native module prints debug information to stdout.
     */
    start(enableLogger?: boolean): void;
    /**
     * Stop emitting keyboard and mouse events.
     */
    stop(): void;
    /**
     * Enable or disable native debug output.
     */
    setDebug(mode: boolean): void;
    /**
     * Use `rawcode` instead of `keycode` when tracking shortcuts.
     */
    useRawcode(using: boolean): void;
    /**
     * Register a global shortcut.
     *
     * The `onDown` callback runs when all keys are pressed. The optional `onUp`
     * callback runs once every key in the shortcut has been released.
     *
     * @returns Function that removes this specific shortcut.
     */
    shortcut(keys: readonly number[], onDown: (keys: number[]) => void, onUp?: (keys: number[]) => void): () => void;
    /**
     * Unregister a shortcut by its key codes.
     */
    removeShortcut(keys: readonly number[]): void;
    /**
     * Unregister all shortcuts.
     */
    clearShortcuts(): void;
};
export type IoHook = Omit<EventEmitter, 'addListener' | 'on' | 'once'> & TPossibleSubscriptions & TIoHookControls;
export declare const iohook: IoHook;
export {};
