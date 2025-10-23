const { spawn } = require('child_process');
const path = require('path');

// Test if the chromium.exe binary can be executed directly
const chromiumPath = 'C:\\Users\\User\\AppData\\Local\\Temp\\chromium.exe';

console.log('🧪 Testing Chromium Binary Execution');
console.log('===================================');
console.log(`📁 Binary path: ${chromiumPath}`);

// Try to run chromium with --version flag
const child = spawn(chromiumPath, ['--version'], {
    stdio: 'inherit'
});

child.on('error', (error) => {
    console.log(`❌ Spawn error: ${error.code} - ${error.message}`);
});

child.on('close', (code) => {
    console.log(`⚡ Process exited with code: ${code}`);
});

child.on('exit', (code, signal) => {
    console.log(`🏁 Process exit - Code: ${code}, Signal: ${signal}`);
});