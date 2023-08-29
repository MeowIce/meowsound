const SlashCommand = require("../../lib/SlashCommand");
const {
	Client,
	Interaction,
	MessageEmbed,
} = require("discord.js");
const LoadCommands = require("../../util/loadCommands");

const command = new SlashCommand()
	.setName("help")
	.setDescription("Giúp đỡ...")
	.setRun(async (client, interaction) => {
		const helpEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setAuthor({
				name: `Câu lệnh của ${ client.user.username }`,
				iconURL: client.config.iconURLHelp,
			})
			.setDescription(`
:warning: Hãy dùng \`/\` kèm với lệnh dưới đây:
🤖 **Chung**
help • stats • summon
🎵 **Nhạc**
clear • loop • loopq • lyrics • move • nowplaying • pause • play • queue • remove • resume • search • seek • shuffle • skip • skipto • summon
\`Ex: /play https://www.youtube.com/watch?v=kTJczUoc26U\`
*NEW: Rewritten !*`)
// disconnect, youtube, volume, filter are legacy commands.

			.setTimestamp()
			await interaction.reply({
				embeds: [helpEmbed],
			})
		});

module.exports = command;
