const { REST } = require('@discordjs/rest');
const { Routes, SlashCommandBuilder } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

let commandsPath = path.join(__dirname, "./commands/");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

const reloadCommands = async (logger) => {
	try {
		logger.info(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		logger.error(error);
	}
};

module.exports = { reloadCommands };