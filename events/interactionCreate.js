const fs = require('node:fs');
const path = require('node:path');

// Not obligated to do the separation because of the collectors
let subEvents = [];
const subEventsPath = path.join(__dirname, './subEvents/interactionCreate/')
const subEventsFiles = fs.readdirSync(subEventsPath).filter(file => file.endsWith('.js'));
for (const file of subEventsFiles) {
	const subEvent = require(subEventsPath+file);
    subEvents.push(subEvent)
}

module.exports = {
    eventString : 'interactionCreate',
    async execute(interaction){
        for (const event of subEvents){
            // Fuckin inefficient way of doing this...
            event.execute(interaction);
        }
        
    }
}