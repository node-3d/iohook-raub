'use strict';

const EventEmitter = require('node:events');

const addon = require('../core');

const events = {
	3: 'keypress',
	4: 'keydown',
	5: 'keyup',
	6: 'mouseclick',
	7: 'mousedown',
	8: 'mouseup',
	9: 'mousemove',
	10: 'mousedrag',
	11: 'mousewheel',
};

const iohook = new EventEmitter();

const state = {
	active: false,
	shortcuts: [],
	eventProperty: 'keycode',
	activatedShortcuts: [],
	lastKeydownShift: false,
	lastKeydownAlt: false,
	lastKeydownCtrl: false,
	lastKeydownMeta: false,
};


/**
 * Handles the shift key. Whenever shift is pressed, all future events would
 * contain { shiftKey: true } in its object, until the shift key is released.
 */
const handleShift = (event) => {
	if (event.type === 'keyup' && event.shiftKey) {
		state.lastKeydownShift = false;
	}
	
	if (event.type === 'keydown' && event.shiftKey) {
		state.lastKeydownShift = true;
	}
	
	if (state.lastKeydownShift) {
		event.shiftKey = true;
	}
};

/**
 * Handles the alt key. Whenever alt is pressed, all future events would
 * contain { altKey: true } in its object, until the alt key is released.
 */
const handleAlt = (event) => {
	if (event.type === 'keyup' && event.altKey) {
		state.lastKeydownAlt = false;
	}
	
	if (event.type === 'keydown' && event.altKey) {
		state.lastKeydownAlt = true;
	}
	
	if (state.lastKeydownAlt) {
		event.altKey = true;
	}
};

/**
 * Handles the ctrl key. Whenever ctrl is pressed, all future events would
 * contain { ctrlKey: true } in its object, until the ctrl key is released.
 */
const handleCtrl = (event) => {
	if (event.type === 'keyup' && event.ctrlKey) {
		state.lastKeydownCtrl = false;
	}
	
	if (event.type === 'keydown' && event.ctrlKey) {
		state.lastKeydownCtrl = true;
	}
	
	if (state.lastKeydownCtrl) {
		event.ctrlKey = true;
	}
};

/**
 * Handles the meta key. Whenever meta is pressed, all future events would
 * contain { metaKey: true } in its object, until the meta key is released.
 */
const handleMeta = (event) => {
	if (event.type === 'keyup' && event.metaKey) {
		state.lastKeydownMeta = false;
	}
	
	if (event.type === 'keydown' && event.metaKey) {
		state.lastKeydownMeta = true;
	}
	
	if (state.lastKeydownMeta) {
		event.metaKey = true;
	}
};

const nonCodeKeys = ['onDown', 'onUp', 'id'];

/**
 * Local shortcut event handler. Only handles keyboard.
 */
const handleShortcut = (event) => {
	if (state.active === false || (event.type !== 'keydown' && event.type !== 'keyup')) {
		return;
	}
	
	// Keep track of shortcuts that are currently active
	const activatedShortcuts = state.activatedShortcuts;
	
	if (event.type === 'keydown') {
		state.shortcuts.forEach((shortcut) => {
			if (shortcut[event[state.eventProperty]] === undefined) {
				return;
			}
			
			// Mark this key as currently being pressed
			shortcut[event[state.eventProperty]] = true;
			
			const keysTmpArray = [];
			let isTriggered = true;
			
			// Iterate through each keyboard key in this shortcut
			Object.keys(shortcut).forEach((key) => {
				if (nonCodeKeys.includes(key)) {
					return;
				}
				
				// If one of the keys aren't pressed...
				if (shortcut[key] === false) {
					// Don't call the callback and empty our temp tracking array
					isTriggered = false;
					keysTmpArray.splice(0, keysTmpArray.length);
					return;
				}
				
				// Add to the array of keys that we will send as an argument
				keysTmpArray.push(+key);
			});
			
			if (!isTriggered) {
				return;
			}
			
			shortcut.onDown(keysTmpArray);
			
			// Add to `activatedShortcuts` if not already there
			if (!activatedShortcuts.includes(shortcut)) {
				activatedShortcuts.push(shortcut);
			}
		});
		return;
	}
	
	// --- KEY UP

	// Mark this key as currently not being pressed in all of our shortcuts
	state.shortcuts.forEach((shortcut) => {
		if (shortcut[event[state.eventProperty]] !== undefined) {
			shortcut[event[state.eventProperty]] = false;
		}
	});
	
	// Check if any of our currently pressed shortcuts have been released
	// "released" means that all of the keys that the shortcut defines are no
	// longer being pressed
	state.activatedShortcuts.forEach((shortcut) => {
		if (shortcut[event[state.eventProperty]] === undefined) {
			return;
		}
		
		let shortcutReleased = true;
		let keysTmpArray = [];
		Object.keys(shortcut).forEach((key) => {
			if (nonCodeKeys.includes(key)) {
				return;
			}
			keysTmpArray.push(+key);
			
			// If any key is true, and thus still pressed, the shortcut is still
			// being held
			if (shortcut[key]) {
				shortcutReleased = false;
			}
		});
		
		if (!shortcutReleased) {
			return;
		}
		
		// Call the released function handler
		shortcut?.onUp(keysTmpArray);
		
		// Remove this shortcut from our activate shortcuts array
		state.activatedShortcuts = state.activatedShortcuts.filter((s) => (s !== shortcut));
	});
};

/**
 * Local event handler.
 */
const handler = (msg) => {
	if (state.active === false || !msg || !events[msg.type]) {
		return;
	}
	
	const event = msg.mouse || msg.keyboard || msg.wheel;
	event.type = events[msg.type];
	
	handleShift(event);
	handleAlt(event);
	handleCtrl(event);
	handleMeta(event);
	
	iohook.emit(event.type, event);
	
	// If there is any registered shortcuts then handle them.
	if (state.shortcuts.length > 0) {
		handleShortcut(event);
	}
};

Object.assign(iohook, {
	start(enableLogger) {
		if (state.active) {
			return;
		}
		state.active = true;
		addon.startHook(handler);
		this.setDebug(enableLogger);
	},
	
	stop() {
		if (!state.active) {
			return;
		}
		state.active = false;
		addon.stopHook();
	},
	
	shortcut(keys, onDown, onUp) {
		const shortcut = {};
		const shortcutId = `${Date.now()}-${Math.random()}`;
		keys.forEach((keyCode) => {
			shortcut[`${keyCode}`] = false;
		});
		shortcut.id = shortcutId;
		shortcut.onDown = onDown;
		shortcut.onUp = onUp;
		state.shortcuts.push(shortcut);
		return () => {
			state.shortcuts = state.shortcuts.filter((shortcut) => (shortcut.id !== shortcutId));
		};
	},
	
	removeShortcut(keyCodes) {
		const searchKeys = keyCodes.map((code) => `${code}`).sort().join('+');
		
		state.shortcuts.filter((shortcut) => {
			const shortcutKeys = Object.keys(
				shortcut,
			).filter(
				(key) => nonCodeKeys.includes(key),
			).sort().join('+');
			
			return shortcutKeys !== searchKeys;
		});
	},
	
	clearShortcuts() {
		state.shortcuts = [];
	},
	
	setDebug(mode) {
		addon.setDebug(!!mode);
	},
	
	useRawcode(using) {
		// If true, use rawcode, otherwise use keycode
		state.eventProperty = using ? 'rawcode' : 'keycode';
	},
});

addon.initHook();
iohook.start();

module.exports = iohook;
