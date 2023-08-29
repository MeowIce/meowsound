const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const prettyMilliseconds = require("pretty-ms");

const command = new SlashCommand()
	.setName("save")
	.setDescription("Lưu bài nhạc hiện tại vào DM của bạn.")
	.setRun(async (client, interaction) => {
		let channel = await client.getChannel(client, interaction);
		if (!channel) {
			return;
		}
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("<:shell32_11:1045304792265793546> Lỗi kết nối Máy chủ âm thanh."),
				],
			});
		}
		
		if (!player) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("<:shell32:1044949839147974696> Hiện tại không phát gì."),
				],
				ephemeral: true,
			});
		}
		
		const sendtoDmEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setAuthor({
				name: "Đã lưu lại.",
				iconURL: client.config.iconURLSaved,
			})
			.setDescription(
				`Đã lưu lại [${ player.queue.current.title }](${ player.queue.current.uri })`,
			)
		
		interaction.user.send({ embeds: [sendtoDmEmbed] });
		
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(
						"<:shell32:1044949839147974696> Vui lòng check DMs của bạn.",
					),
			],
			ephemeral: true,
		});
	});

module.exports = command;
