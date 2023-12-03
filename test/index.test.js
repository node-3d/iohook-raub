'use strict';

const assert = require('node:assert').strict;
const { describe, it, after } = require('node:test');

const iohook = require('..');

const methods = [
	'start', 'stop', 'setDebug', 'useRawcode', 'shortcut',
	'removeShortcut', 'clearShortcuts',
];

describe('iohook', () => {
	after(iohook.stop);
	
	methods.forEach((name) => {
		it(`exports method #${name}`, () => {
			assert.ok(iohook[name]);
		});
	});
});
