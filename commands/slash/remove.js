const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");

const command = new SlashCommand()
	.setName("remove")
	.setDescription("Xóa bài nhạc khỏi hàng chờ.")
	.addNumberOption((option) =>
		option
			.setName("id")
			.setDescription("ID bài...")
			.setRequired(true),
	)
	
	.setRun(async (client, interaction) => {
		const args = interaction.options.getNumber("id");
		
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
						.setDescription("<:shell32:1044949839147974696> Không có gì để xóa."),
				],
				ephemeral: true,
			});
		}
		
		await interaction.deferReply();
		
		const position = Number(args) - 1;
		if (position > player.queue.size) {
			let thing = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription(
					`<:shell32:1044949839147974696> Hàng chờ hiện tại chỉ có **${ player.queue.size }** bài.`,
				);
			return interaction.editReply({ embeds: [thing] });
		}
		
		const song = player.queue[position];
		player.queue.remove(position);
		
		const number = position + 1;
		let removeEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(`<:delete:810858845428645898> Đã xóa bỏ ID **${ number }** khỏi hàng chờ.`);
		return interaction.editReply({ embeds: [removeEmbed] });
	});

module.exports = command;
