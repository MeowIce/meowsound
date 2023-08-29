const { ContextMenuCommandBuilder } = require("@discordjs/builders");

module.exports = {
	command: new ContextMenuCommandBuilder().setName("Execute").setType(2),
	
	/**
	 * This function will handle context menu interaction
	 * @param {import("../lib/MeowAudioCore")} client
	 * @param {import("discord.js").GuildContextMenuInteraction} interaction
	 */
	run: (client, interaction, options) => {
		interaction.reply(`<:shell32_0012:1044613142002548787> Test context menu for future updates to MeowSound :3`);
	},
};
