const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = async (client, message) => {
	const refront = `^<@!?${client.user.id}>`;
	const mention = new RegExp(refront + "$");

	if (message.content.match(mention)) {
		const mentionEmbed = new MessageEmbed()
			.setColor(client.config.embedColor)
			.setDescription(
				`<:shell32:1044949839147974696> Vui lòng sử dụng lệnh ứng dụng (App command/Slash command) để tương tác với bot !`,
			);

		message.channel.send({
			embeds: [mentionEmbed],
		});
	}
};
