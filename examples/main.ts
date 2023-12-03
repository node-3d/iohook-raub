'use strict';

import iohook from 'iohook-raub';


iohook.on('mousedown', (msg) => {
  console.log(msg);
});

iohook.on('keypress', (msg) => {
  console.log(msg);
});

iohook.on('keydown', (msg) => {
  console.log(msg);
});

iohook.on('keyup', (msg) => {
  console.log(msg);
});

iohook.on('mouseclick', (msg) => {
  console.log(msg);
});

iohook.on('mousewheel', (msg) => {
  console.log(msg);
});

iohook.on('mousemove', (msg) => {
  // console.log(msg);
});

iohook.on('mousedrag', (msg) => {
  console.log(msg);
});

// const CTRL = 29;
// const ALT = 56;
// const F7 = 65;

// iohook.registerShortcut([CTRL, F7], (keys) => {
//   console.log('Shortcut pressed with keys:', keys);
// });

// let shId = iohook.registerShortcut([ALT, F7], (keys) => {
//   console.log('This shortcut will be called once. Keys:', keys);
//   iohook.unregisterShortcut(shId);
// });

iohook.on('mouseup', (event) => console.log(event));

iohook.start();
// iohook.setDebug(true); // Uncomment this line for see all debug information from iohook

console.log('Hook started. Try input.');


setTimeout(() => {
  iohook.stop();
  console.log('Hook stopped for 3 sec.');
  
  setTimeout(() => {
    iohook.start();
    console.log('Hook RESTARTED.');
    
    setTimeout(() => {
      console.log('Hook stopped.');
      iohook.stop();
    }, 3000);
  }, 3000);
}, 3000);

