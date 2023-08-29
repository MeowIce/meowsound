const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("move")
	.setDescription("Di chuyển bài nhạc đến vị trí khác.")
	.addIntegerOption((option) =>
		option
			.setName("id")
			.setDescription("ID bài hát...")
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName("to")
			.setDescription("Đến...")
			.setRequired(true),
	)
	
	.setRun(async (client, interaction) => {
		const track = interaction.options.getInteger("id");
		const position = interaction.options.getInteger("to");
		
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
						.setDescription("<:shell32:1044949839147974696> Không có gì đang phát."),
				],
				ephemeral: true,
			});
		}
		
		let trackNum = Number(track) - 1;
		if (trackNum < 0 || trackNum > player.queue.length - 1) {
			return interaction.reply("<:shell32:1044949839147974696> ID không hợp lệ.");
		}
		
		let dest = Number(position) - 1;
		if (dest < 0 || dest > player.queue.length - 1) {
			return interaction.reply("<:shell32:1044949839147974696> Đích đến không hợp lệ.");
		}
		
		const thing = player.queue[trackNum];
		player.queue.splice(trackNum, 1);
		player.queue.splice(dest, 0, thing);
		return interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription("<:shell32_0079:1044613134377300068> Đã di chuyển."),
			],
		});
	});

module.exports = command;
