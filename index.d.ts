declare module "iohook-raub" {
	
	type EventEmitter = import('node:events').EventEmitter;
	
	// type TEvent = {
	// 	type: string;
	// 	keychar?: number;
	// 	keycode?: number;
	// 	rawcode?: number;
	// 	button?: number;
	// 	clicks?: number;
	// 	x?: number;
	// 	y?: number;
	// }
	
	type IoHook = EventEmitter & {
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
		 * Register global shortcut. When all keys in keys array pressed, callback will be called
		 * @param {Array<string|number>} keys Array of keycodes
		 * @param {Function} callback Callback for when shortcut pressed
		 * @param {Function} [releaseCallback] Callback for when shortcut released
		 * @return {number} ShortcutId for unregister
		 */
		registerShortcut(
			keys: Array<string | number>,
			callback: Function,
			releaseCallback?: Function
		): number;
		
		/**
		 * Unregister shortcut by ShortcutId
		 * @param {number} shortcutId
		 */
		unregisterShortcut(shortcutId: number): void;
		
		/**
		 * Unregister shortcut via its key codes
		 * @param {Array<string|number>} keys
		 */
		unregisterShortcut(keys: Array<string | number>): void;
		
		/**
		 * Unregister all shortcuts
		 */
		unregisterAllShortcuts(): void;
	};
	
	const iohook: IoHook;
	
	export = iohook;
}
