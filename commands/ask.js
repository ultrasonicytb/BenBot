const { SlashCommandBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const imagesPath = path.join(__dirname, '../src/BenReact');
const imagesFiles = fs.readdirSync(imagesPath).filter(file => file.endsWith('.gif'));

let ask = new SlashCommandBuilder()
    .setName("ask")
    .setDescription("ask something to ben")
    .addStringOption(option =>
        option
            .setName("question")
            .setDescription("question to ask")
            .setRequired(true)
    )

module.exports = {
    data: ask,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === ask.name) {
            const question = interaction.options.getString("question")
            interaction.client.logger.info(`${interaction.user.username}(${interaction.user.id}) used the ${ask.name} command in ${interaction.channel.name} with the text "${question}"`);
            // Read the buffer from a random file
            const random = Math.floor(Math.random() * imagesFiles.length);
            const buffer = fs.readFileSync(path.join(imagesPath, imagesFiles[random]));
            // Create an attachment from the buffer
            const attachment = new AttachmentBuilder(buffer, { name: imagesFiles[random] });
            // Reply with the attachment
            const str = `**${interaction.member.nickname}** asked lord Ben :\n"${question}" : `
            await interaction.deferReply()
            await interaction.reply({ content : str, files: [attachment] })
        }
    }
}