const { SlashCommandBuilder } = require('discord.js');
const { voiceLib } = require("../lib/voiceLib.js");

let rec = new SlashCommandBuilder()
    .setName("rec")
    .setDescription("rec command ")

module.exports = {
    data : rec,
    async execute(interaction){
        if (!interaction.isChatInputCommand()) return;
        
        if (interaction.commandName === rec.name){
            interaction.client.logger.info(`${interaction.user.username}(${interaction.user.id}) used the ${rec.name} command in ${interaction.channel.name}`);
            user = interaction.member.user;
            if (interaction.member.voice.channelId == null) {
                await interaction.reply("You are not in a voice channel")
                return;
            }
            const channel = interaction.member.voice.channel;
            const connection = voiceLib.join(channel, { selfDeaf: false });
            const stream = voiceLib.listen(connection, interaction.member.id, true);
            const player = voiceLib.playStream(connection, stream);



            // Create a listener to wait for the user to leave the channel
            const listener = (oldState, newState) => {
                if (channel.members.size == 1) {
                    // Users left the channel
                    player.stop();
                    voiceLib.leave(connection);
                    interaction.client.removeListener('voiceStateUpdate', listener);
                }
                console.log(channel.members.size);
            } 
            // Wait for the user to leave the channel
            interaction.client.on('voiceStateUpdate', listener);
            await interaction.deferReply()
            await interaction.deleteReply()
        }
    }
}
