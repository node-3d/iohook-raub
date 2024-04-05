'use strict';

import iohook from 'iohook-raub';

iohook.on('keypress', (msg) => {
  console.log('keypress', msg);
});

iohook.on('keydown', (msg) => {
  console.log('keydown', msg);
});

iohook.on('keyup', (msg) => {
  console.log('keyup', msg);
});

iohook.start();
// iohook.setDebug(true); // Uncomment this line for see all debug information from iohook

console.log('Hook started.');

setInterval(() => {
  console.log('Hook is working...');
}, 5000);

