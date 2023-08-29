/**
 *
 * @param {import("../lib/MeowAudioCore")} client
 * @param {import("discord.js").GuildCommandInteraction} interaction
 * @returns
 */
module.exports = async (client, interaction) => {
	return new Promise(async (resolve) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"Bạn phải ở trong một kênh thoại để sử dụng lệnh này ÒwÓ !",
					),
				],
			});
			return resolve(false);
		}
		if (
			interaction.guild.me.voice.channel &&
			interaction.member.voice.channel.id !==
			interaction.guild.me.voice.channel.id
		) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"<:shell32:1044949839147974696> Bạn phải ở cùng kênh thoại với tôi để sử dụng lệnh này !",
					),
				],
			});
			return resolve(false);
		}
		if (!interaction.member.voice.channel.joinable) {
			await interaction.reply({
				embeds: [
					client.ErrorEmbed(
						"<:shell32:1044949795338457128> Tớ không có đủ quyền để tham gia kênh thoại của bạn !",
					),
				],
			});
			return resolve(false);
		}
		
		resolve(interaction.member.voice.channel);
	});
};
