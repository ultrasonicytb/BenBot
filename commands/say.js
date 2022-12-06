const { SlashCommandBuilder } = require('discord.js');

let say = new SlashCommandBuilder()
    .setName("say")
    .setDescription("say command ")
    .addStringOption(option => 
        option
            .setName("text")
            .setDescription("text to say")
            .setRequired(true)
        )

module.exports = {
    data : say,
    async execute(interaction){
        if (!interaction.isChatInputCommand()) return;
        
        if (interaction.commandName === say.name){
            interaction.client.logger.info(`${interaction.user.username}(${interaction.user.id}) used the say command in ${interaction.channel.name} with the text "${interaction.options.getString("text")}"`);
            const toSay = interaction.options.getString("text")
            await interaction.channel.send(toSay)
            await interaction.deferReply()
            await interaction.deleteReply()
            
        }
    }
}