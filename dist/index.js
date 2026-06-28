import node_events from "node:events";
import { createRequire } from "node:module";
import { getBin } from "@node-3d/addon-tools";
import "@node-3d/deps-uiohook";
import "@node-3d/segfault";
const NativeEventType = {
    KeyTyped: 3,
    KeyPressed: 4,
    KeyReleased: 5,
    MouseClicked: 6,
    MousePressed: 7,
    MouseReleased: 8,
    MouseMoved: 9,
    MouseDragged: 10,
    MouseWheel: 11
};
const loadAddon = createRequire(import.meta.url);
const native_native = loadAddon(`../${getBin()}/iohook.node`);
const eventNames = {
    [NativeEventType.KeyTyped]: 'keypress',
    [NativeEventType.KeyPressed]: 'keydown',
    [NativeEventType.KeyReleased]: 'keyup',
    [NativeEventType.MouseClicked]: 'mouseclick',
    [NativeEventType.MousePressed]: 'mousedown',
    [NativeEventType.MouseReleased]: 'mouseup',
    [NativeEventType.MouseMoved]: 'mousemove',
    [NativeEventType.MouseDragged]: 'mousedrag',
    [NativeEventType.MouseWheel]: 'mousewheel'
};
const state = {
    active: false,
    activatedShortcuts: [],
    eventProperty: 'keycode',
    lastKeydownAlt: false,
    lastKeydownCtrl: false,
    lastKeydownMeta: false,
    lastKeydownShift: false,
    shortcuts: []
};
const isKeyboardEvent = (event)=>'keypress' === event.type || 'keydown' === event.type || 'keyup' === event.type;
const applyModifierState = (event, property, stateProperty)=>{
    if ('keyup' === event.type && event[property]) state[stateProperty] = false;
    if ('keydown' === event.type && event[property]) state[stateProperty] = true;
    if (state[stateProperty]) event[property] = true;
};
const getShortcutSignature = (keys)=>[
        ...keys
    ].toSorted((left, right)=>left - right).join('+');
const getShortcutKeys = (shortcut)=>[
        ...shortcut.keys.keys()
    ];
const handleShortcutKeydown = (event)=>{
    const eventKey = event[state.eventProperty];
    for (const shortcut of state.shortcuts){
        if (!shortcut.keys.has(eventKey)) continue;
        shortcut.keys.set(eventKey, true);
        const keys = getShortcutKeys(shortcut);
        const isTriggered = [
            ...shortcut.keys.values()
        ].every(Boolean);
        if (isTriggered) {
            shortcut.onDown(keys);
            if (!state.activatedShortcuts.includes(shortcut)) state.activatedShortcuts.push(shortcut);
        }
    }
};
const handleShortcutKeyup = (event)=>{
    const eventKey = event[state.eventProperty];
    for (const shortcut of state.shortcuts)if (shortcut.keys.has(eventKey)) shortcut.keys.set(eventKey, false);
    for (const shortcut of state.activatedShortcuts){
        if (!shortcut.keys.has(eventKey)) continue;
        const isReleased = [
            ...shortcut.keys.values()
        ].every((isPressed)=>!isPressed);
        if (isReleased) {
            shortcut.onUp?.(getShortcutKeys(shortcut));
            state.activatedShortcuts = state.activatedShortcuts.filter((activeShortcut)=>activeShortcut !== shortcut);
        }
    }
};
const handleShortcut = (event)=>{
    if (!state.active || !isKeyboardEvent(event) || 'keypress' === event.type) return;
    if ('keydown' === event.type) return void handleShortcutKeydown(event);
    handleShortcutKeyup(event);
};
const createEvent = (message)=>{
    const type = eventNames[message.type];
    if (message.keyboard) return {
        ...message.keyboard,
        mask: message.mask,
        time: message.time,
        type: type
    };
    if (message.mouse) return {
        ...message.mouse,
        mask: message.mask,
        time: message.time,
        type: type
    };
    if (message.wheel) return {
        amount: message.wheel.amount,
        clicks: message.wheel.clicks,
        direction: message.wheel.direction,
        mask: message.mask,
        rotation: message.wheel.rotation,
        time: message.time,
        type: 'mousewheel',
        x: message.wheel.x,
        y: message.wheel.y
    };
    return null;
};
class IoHookController extends node_events {
    start(enableLogger = false) {
        if (state.active) return;
        state.active = true;
        native_native.startHook((message)=>{
            this.handleMessage(message);
        });
        this.setDebug(enableLogger);
    }
    stop() {
        if (!state.active) return;
        state.active = false;
        native_native.stopHook();
    }
    shortcut(keys, onDown, onUp) {
        const shortcutId = `${Date.now()}-${Math.random()}`;
        const shortcut = {
            id: shortcutId,
            keys: new Map(keys.map((keyCode)=>[
                    keyCode,
                    false
                ])),
            onDown,
            onUp
        };
        state.shortcuts.push(shortcut);
        return ()=>{
            state.shortcuts = state.shortcuts.filter(({ id })=>id !== shortcutId);
            state.activatedShortcuts = state.activatedShortcuts.filter(({ id })=>id !== shortcutId);
        };
    }
    removeShortcut(keys) {
        const searchKeys = getShortcutSignature(keys);
        state.shortcuts = state.shortcuts.filter((shortcut)=>getShortcutSignature(shortcut.keys.keys()) !== searchKeys);
        state.activatedShortcuts = state.activatedShortcuts.filter((shortcut)=>getShortcutSignature(shortcut.keys.keys()) !== searchKeys);
    }
    clearShortcuts() {
        state.shortcuts = [];
        state.activatedShortcuts = [];
    }
    setDebug(mode) {
        native_native.setDebug(mode);
    }
    useRawcode(using) {
        state.eventProperty = using ? 'rawcode' : 'keycode';
    }
    handleMessage(message) {
        if (!state.active) return;
        const event = createEvent(message);
        if (!event) return;
        applyModifierState(event, 'shiftKey', 'lastKeydownShift');
        applyModifierState(event, 'altKey', 'lastKeydownAlt');
        applyModifierState(event, 'ctrlKey', 'lastKeydownCtrl');
        applyModifierState(event, 'metaKey', 'lastKeydownMeta');
        this.emit(event.type, event);
        handleShortcut(event);
    }
}
const iohook = new IoHookController();
native_native.initHook();
iohook.start();
export { iohook };
