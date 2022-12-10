const { SlashCommandBuilder } = require('discord.js');
const { voiceLib } = require("../lib/voiceLib.js");

let stopRec = new SlashCommandBuilder()
    .setName("stoprec")
    .setDescription("stopRec command ")

module.exports = {
    data : stopRec,
    async execute(interaction){
        if (!interaction.isChatInputCommand()) return;
        
        if (interaction.commandName === stopRec.name){
            interaction.client.logger.info(`${interaction.user.username}(${interaction.user.id}) used the ${stopRec.name} command in ${interaction.channel.name}`);
            user = interaction.member.user;
            if (interaction.member.voice.channelId == null) {
                await interaction.reply("You are not in a voice channel")
                return;
            }
            const channel = interaction.member.voice.channel;
            voiceLib.stop(channel);
            await interaction.deferReply()
            await interaction.deleteReply()
        }
    }
}