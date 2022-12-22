const { SlashCommandBuilder } = require('discord.js');

let command = new SlashCommandBuilder()
    .setName("n")
    .setDescription("n-site command")
    .addIntegerOption(option => 
        option
            .setName("number")
            .setDescription("number")
            .setRequired(false)
        )
    .addIntegerOption(option => 
        option
            .setName("page")
            .setDescription("page number")
            .setRequired(false)
    )
    .addBooleanOption(option =>
        option
            .setName("verbose")
            .setDescription("verbose")
            .setRequired(false)
    )

module.exports = {
    data : command,
    async execute(interaction){
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === command.name){
            interaction.client.logger.info(`${interaction.user.username}(${interaction.user.id}) used the ${command.name} command in ${interaction.channel.name}`);
            const number = interaction.options.getInteger("number");
            const page = interaction.options.getInteger("page");
            const verbose = interaction.options.getBoolean("verbose");
            
            await interaction.deferReply()
            
            if (verbose != null){
                // Not implemented
                await interaction.editReply(`Verbose is not implemented yet`);
                return;
            }
            if (number == null){
                // Choose a random number between 100000 and 999999
                const number = Math.floor(Math.random() * 999999) + 100000;
            }
            editReply(`Number: ${number}; Page: ${page}`);
            
        }
    }
}
