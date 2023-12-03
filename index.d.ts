declare module "iohook-raub" {
	
	type EventEmitter = import('node:events').EventEmitter;
	
	type THookEventCommon = {
		mask: number;
		time: number;
	};
	
	type TEventNameKeyboard = 'keypress' | 'keydown' | 'keyup';
	
	type TEventNameMouse = 'mouseclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mousedrag';
	
	type TEventNameWheel = 'mousewheel';
	
	type THookEventKeyboard = THookEventCommon & {
		type: TEventNameKeyboard;
		shiftKey: boolean;
		altKey: boolean;
		ctrlKey: boolean;
		metaKey: boolean;
		keychar: number;
		keycode: number;
		rawcode: number;
	};
	
	type THookEventMouse = THookEventCommon & {
		type: TEventNameMouse;
		button: number;
		clicks: number;
		x: number;
		y: number;
	};
	
	type THookEventWheel = THookEventCommon & {
		type: TEventNameWheel;
		amount: number;
		clicks: number;
		direction: number;
		rotation: number;
		x: number;
		y: number;
	};
	
	interface TPossibleSubscriptions {
		addListener(eventName: TEventNameKeyboard, listener: (event: THookEventKeyboard) => void): this;
		addListener(eventName: TEventNameMouse, listener: (event: THookEventMouse) => void): this;
		addListener(eventName: TEventNameWheel, listener: (event: THookEventWheel) => void): this;
		on(eventName: TEventNameKeyboard, listener: (event: THookEventKeyboard) => void): this;
		on(eventName: TEventNameMouse, listener: (event: THookEventMouse) => void): this;
		on(eventName: TEventNameWheel, listener: (event: THookEventWheel) => void): this;
		once(eventName: TEventNameKeyboard, listener: (event: THookEventKeyboard) => void): this;
		once(eventName: TEventNameMouse, listener: (event: THookEventMouse) => void): this;
		once(eventName: TEventNameWheel, listener: (event: THookEventWheel) => void): this;
	}
	
	type IoHook = Omit<EventEmitter, 'addListener' | 'on' | 'once'> & TPossibleSubscriptions & {
		/**
		 * Start hooking engine. Call it when you ready to receive events
		 * If `enableLogger` is true, module will publish debug information to stdout
		 */
		start(enableLogger?: boolean): void;
		
		/**
		 * Stop rising keyboard/mouse events
		 */
		stop(): void;
		
		/**
		 * Enable/Disable stdout debug.
		 */
		setDebug(mode: boolean): void;
		
		/**
		 * Specify that key event's `rawcode` property should be used instead of
		 * `keycode` when listening for key presses.
		 *
		 * This allows iohook to be used in conjunction with other programs that may
		 * only provide a keycode.
		 */
		useRawcode(using: boolean): void;
		
		/**
		 * Register a global shortcut. When all keys in keys array pressed, callback will be called
		 * 
		 * @returns Function that removes this specific shortcut.
		 */
		shortcut(
			/**
			 * Array of keycodes.
			 */
			keys: number[],
			/**
			 * Callback for when shortcut pressedю
			 */
			onDown: (keys: number[]) => void,
			/**
			 * Callback for when shortcut releasedю
			 */
			onUp?: (keys: number[]) => void
		): (() => void);
		
		/**
		 * Unregister shortcut via its key codes.
		 */
		removeShortcut(keys: number[]): void;
		
		/**
		 * Unregister all shortcuts.
		 */
		clearShortcuts(): void;
	};
	
	const iohook: IoHook;
	
	export = iohook;
}
