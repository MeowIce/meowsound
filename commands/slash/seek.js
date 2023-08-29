const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

const command = new SlashCommand()
	.setName("seek")
	.setDescription("Tua đến một vị trí nào đó trong bài nhạc.")
	.addStringOption((option) =>
		option
			.setName("to")
			.setDescription("Tua đến...; VD: 1h 30m | 60s | 180m")
			.setRequired(true),
	)
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
						.setDescription("<:shell32:1044949839147974696> Hiện tại không phát gì."),
				],
				ephemeral: true,
			});
		}
		
		await interaction.deferReply();

		const rawArgs = interaction.options.getString("to");
		const args = rawArgs.split(' ');
		var rawTime = [];
		for (i = 0; i < args.length; i++){
			rawTime.push(ms(args[i]));
		}
		const time = rawTime.reduce((a,b) => a + b, 0);

		const position = player.position;
		const duration = player.queue.current.duration;
		
		if (time <= duration) {
			player.seek(time);
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(client.config.embedColor)
						.setDescription(
							`<:shell32:1044949839147974696> **${ player.queue.current.title }** đã được tua đến **${ ms(time) }**`,
						),
				],
			});
		} else {
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(client.config.embedColor)
						.setDescription(
							`<:shell32:1044949839147974696> Không thể tua. Hãy thử kiểm tra lại cú pháp lệnh hoặc bài nhạc không thể tua được nữa !`,
						),
				],
			});
		}
	});

module.exports = command;
