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
 * @param event Event object
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
 * @param event Event object
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
 * @param event Event object
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
 * @param event Event object
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

/**
 * Local shortcut event handler
 * @param event Event object
 * @private
 */
const handleShortcut = (event) => {
	if (state.active === false) {
		return;
	}
	
	// Keep track of shortcuts that are currently active
	let activatedShortcuts = state.activatedShortcuts;
	
	if (event.type === 'keydown') {
		state.shortcuts.forEach((shortcut) => {
			if (shortcut[event[state.eventProperty]] !== undefined) {
				// Mark this key as currently being pressed
				shortcut[event[state.eventProperty]] = true;
				
				let keysTmpArray = [];
				let callme = true;
				
				// Iterate through each keyboard key in this shortcut
				Object.keys(shortcut).forEach((key) => {
					if (key === 'callback' || key === 'releaseCallback' || key === 'id')
						return;
					
					// If one of the keys aren't pressed...
					if (shortcut[key] === false) {
						// Don't call the callback and empty our temp tracking array
						callme = false;
						keysTmpArray.splice(0, keysTmpArray.length);
						
						return;
					}
					
					// Otherwise, this key is being pressed.
					// Add it to the array of keyboard keys we will send as an argument
					// to our callback
					keysTmpArray.push(key);
				});
				if (callme) {
					shortcut.callback(keysTmpArray);
					
					// Add this shortcut from our activate shortcuts array if not
					// already activated
					if (activatedShortcuts.indexOf(shortcut) === -1) {
						activatedShortcuts.push(shortcut);
					}
				}
			}
		});
	} else if (event.type === 'keyup') {
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
			if (shortcut[event[state.eventProperty]] === undefined) return;
			
			let shortcutReleased = true;
			let keysTmpArray = [];
			Object.keys(shortcut).forEach((key) => {
				if (key === 'callback' || key === 'releaseCallback' || key === 'id')
					return;
				keysTmpArray.push(key);
				
				// If any key is true, and thus still pressed, the shortcut is still
				// being held
				if (shortcut[key]) {
					shortcutReleased = false;
				}
			});
			
			if (shortcutReleased) {
				// Call the released function handler
				if (shortcut.releaseCallback) {
					shortcut.releaseCallback(keysTmpArray);
				}
				
				// Remove this shortcut from our activate shortcuts array
				const index = state.activatedShortcuts.indexOf(shortcut);
				if (index !== -1) state.activatedShortcuts.splice(index, 1);
			}
		});
	}
};

/**
 * Local event handler.
 * @param msg Raw event message
 */
const handler = (msg) => {
	if (state.active === false || !msg) {
		return;
	}
	
	if (events[msg.type]) {
		const event = msg.mouse || msg.keyboard || msg.wheel;
		
		event.type = events[msg.type];
		
		handleShift(event);
		handleAlt(event);
		handleCtrl(event);
		handleMeta(event);
		
		iohook.emit(events[msg.type], event);
		
		// If there is any registered shortcuts then handle them.
		if (
			(event.type === 'keydown' || event.type === 'keyup') &&
			iohook.shortcuts.length > 0
		) {
			handleShortcut(event);
		}
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
	
	registerShortcut(keys, onDown, onUp) {
		const shortcut = {};
		const shortcutId = Date.now() + Math.random();
		keys.forEach((keyCode) => {
			shortcut[keyCode] = false;
		});
		shortcut.id = shortcutId;
		shortcut.callback = onDown;
		shortcut.releaseCallback = onUp;
		state.shortcuts.push(shortcut);
		return shortcutId;
	},
	
	unregisterShortcut(shortcutId) {
		state.shortcuts.forEach((shortcut, i) => {
			if (shortcut.id === shortcutId) {
				state.shortcuts.splice(i, 1);
			}
		});
	},
	
	unregisterShortcutByKeys(keyCodes) {
		// A traditional loop is used in order to access `this` from inside
		for (let i = 0; i < state.shortcuts.length; i++) {
			let shortcut = state.shortcuts[i];
			
			// Convert any keycode numbers to strings
			keyCodes.forEach((key, index) => {
				if (typeof key !== 'string' && !(key instanceof String)) {
					// Convert to string
					keyCodes[index] = key.toString();
				}
			});
			
			// Check if this is our shortcut
			Object.keys(shortcut).every((key) => {
				if (key === 'callback' || key === 'id') return;
				
				// Remove all given keys from keyCodes
				// If any are not in this shortcut, then this shortcut does not match
				// If at the end we have eliminated all codes in keyCodes, then we have succeeded
				let index = keyCodes.indexOf(key);
				if (index === -1) return false; // break
				
				// Remove this key from the given keyCodes array
				keyCodes.splice(index, 1);
				return true;
			});
			
			// Is this the shortcut we want to remove?
			if (keyCodes.length === 0) {
				// Unregister this shortcut
				state.shortcuts.splice(i, 1);
				return;
			}
		}
	},
	
	unregisterAllShortcuts() {
		state.shortcuts.splice(0, state.shortcuts.length);
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
