const { Discord, MessageEmbed } = require("discord.js");
const SlashCommand = require("../../lib/SlashCommand");
const moment = require("moment");
require("moment-duration-format");
require("moment-timezone");

const command = new SlashCommand()
	.setName("about")
	.setDescription("Thông tin về bot.")
	.setRun(async (client, interaction,) => {
		const ver = require("../../package.json")
		const embed = new MessageEmbed()
			.setTitle("<:shell32_0002:1044613136491229194> Thông tin về bot...")
			.setColor(client.config.embedColor)
			.setFields([
				{
					name: `Lead Developer:`,
					value: `<@${client.config.adminId}>`,
				},
				{
					name: `Tester:`,
					value: `<@775939295298322453>`,
				},
				{
					name: `Created:`,
					value: `<t:${moment(client.user.createdTimestamp)
						.tz("Asia/Ho_Chi_Minh")
						.unix()}:R>`,
				}
			])
			.setDescription(`**System Configurations**\nCodec: erelajs-lavaplayer\nPlayer: SuperPlayerJS\nVersion: ${ver.version}\nDebugged: ${client.config.debug}\nVol: ${client.config.defaultVolume}`)
		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	});
module.exports = command;
