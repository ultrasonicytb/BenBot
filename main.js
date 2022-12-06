// Create a child process to start the bot
const child = require('child_process');

// Create a function to start the bot
// Return a promise to wait for the next reboot
const boot = () => {
    const childProcess = child.fork('./bot.js', []);
    // Return a promise to wait for the next reboot
    return new Promise((resolve, reject) => {
        childProcess.on('exit', (code, signal) => {
            // for the moment we don't care about the exit code
            resolve();
        });
    });
}

const main = async () => {
    while (true) {
        // if the promise is resolved, start the bot again
        // if the promise is rejected, stop the bot
        await boot().catch(() => process.exit());
    }
}

main();