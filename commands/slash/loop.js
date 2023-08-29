const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("loop")
	.setDescription("Chế độ lặp lại.")
	.setRun(async (client, interaction, options) => {
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
						.setDescription("<:shell32:1044949839147974696> Hiện tại không có gì đang phát."),
				],
				ephemeral: true,
			});
		}
		
		if (player.setTrackRepeat(!player.trackRepeat)) {
			;
		}
		const trackRepeat = player.trackRepeat? "bật" : "tắt";
		
		interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(`<:Icon_0277:810858844925591562> Chế độ lặp lại đã **\`${ trackRepeat }\`**`),
			],
		});
	});

module.exports = command;
