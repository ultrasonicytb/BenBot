module.exports = {
    async execute(interaction){
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            interaction.client.logger.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}