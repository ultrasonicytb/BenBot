const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { nExists, mExists } = require('../lib/webRequests');
const { pageDichotomy } = require('../lib/helpers');

const response = async (interaction, res) => {
    switch (res){
        case "LocError":
            await interaction.editReply(`No proxies/VPN available !`);
            return false;
        case false:
            await interaction.editReply(`Page doesn't exist !`);
            return false;
        case "CaptchaError":
            await interaction.editReply(`Cloudflare error !`);
            return false;
        case "FetchError":
            await interaction.editReply(`Error !`);
            return false;
        default:
            return true;
    }
}

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

        if (interaction.commandName !== command.name) return;

        interaction.client.logger.info(`${interaction.user.username}(${interaction.user.id}) used the ${command.name} command in ${interaction.channel.name}`);
        let number = interaction.options.getInteger("number");
        let page = interaction.options.getInteger("page");
        const verbose = interaction.options.getBoolean("verbose");
        let exists = false;

        await interaction.deferReply()
        if (verbose != null){
            // Not implemented
            await interaction.editReply(`Verbose is not implemented yet`);
            return;
        }
        // Check if the number exists
        if (number != null){
            exists = await nExists(number);
            if (!await response(interaction, exists)) return;
        }
        // Generate a random number if the number is not specified
        while (!exists){
            number = Math.floor(Math.random() * 999999) + 100000;
            exists = await nExists(number);
            if (exists === false) continue;
            if (!await response(interaction, exists)) return;
        }
        // Check if the page exists
        if (page == null){
            // Find the last page
            const lastPage = await pageDichotomy(async (page) => {
                return await nExists(number, page);
            });
            if (!await response(interaction, exists)) return;
            // Choose a random page
            page = Math.floor(Math.random() * lastPage) + 1;
        }
        const imageBuffer = await mExists(number, page, true);
        if (!await response(interaction, imageBuffer)) return;
        const attachment = new AttachmentBuilder()
            .setName(`n${number}p${page}.png`)
            .setFile(imageBuffer)

        await interaction.editReply({files: [attachment]});
    }
}
