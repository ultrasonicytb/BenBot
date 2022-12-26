const { ga } = require('../config.json');

module.exports = {
    eventString : 'messageCreate',
    async execute(message){
        // Ignore messages from bots
        if (message.author.bot) return;

        if (message.member.roles.cache.has(ga) && message.channel.isTextBased()){
            // One out of every 6 messages will be a sticker
            if (Math.floor(Math.random() * 6) != 0){ return; }

            message.channel.send({ stickers : message.guild.stickers.cache.filter(s => s.name === "ga")})
        }

        return;

    }
}