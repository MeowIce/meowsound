const { MessageEmbed, version, Discord } = require("discord.js");
const process = require("process");
const moment = require("moment");
require("moment-duration-format");
const os = require("os");
const SlashCommand = require("../../lib/SlashCommand");


const command = new SlashCommand()
	.setName("status")
	.setDescription("Lấy trạng thái của bot")
	.setRun(async (client, interaction) => {
		//OS info
		const osVer = os.platform() + " " + os.release();
		//Node ver
		const nodeVer = process.version;
		//Bot uptime
		const uptime = moment
			.duration(client.uptime)
			.format("d[d]・h[h]・m[m]・s[s]");
		//System uptime
		var sysUptime = moment
			.duration(os.uptime() * 1000)
			.format("d[d]・h[h]・m[m]・s[s]");
		var sysMemUsed = Math.round(process.memoryUsage().rss / 1024 / 1024)
		var sysMemTotal = Math.round(os.totalmem / (1024 * 1024));
		//Bot version
		const package = require("../../package.json");
			// show lavalink uptime
			const lavauptime = moment
				.duration(client.manager.nodes.values().next().value.stats.uptime)
				.format(" D[d], H[h], m[m]");
			// show lavalink memory usage
			const lavaram = (
				client.manager.nodes.values().next().value.stats.memory.used /
				1024 /
				1024
			).toFixed(2);
			// sow lavalink memory allocated
			const lavamemallocated = (
				client.manager.nodes.values().next().value.stats.memory.allocated /
				1024 /
				1024
			).toFixed(2);
		const embed = new MessageEmbed()
			.setTitle(`Trạng thái của ${client.user.username}`)
			.setColor(client.config.embedColor)
			.setDescription(
				`\`\`\`yml\nUsername: ${client.user.username}#${client.user.discriminator} [${client.user.id}]\nAPI Latency: ${client.ws.ping}ms\nUptime: ${uptime}\`\`\``
			)
			.setFields([
				{
					name: "Thông tin software",
					value: `\`\`\`yml\nGuilds: ${client.guilds.cache.size}\nNodeJS version: ${nodeVer}\nDiscord.JS version: ${version}\nMeowSound version: ${package.version}\`\`\``,
					inline: true,
				},
				{
					name: `Thông tin Lavalink`,
					value: `\`\`\`yml\nUptime: ${ lavauptime }\nRAM: ${ lavaram } MB\nAllocated Mem: ${lavamemallocated} MB\nPlaying: ${
						client.manager.nodes.values().next().value.stats.playingPlayers
					} trên tổng số ${
						client.manager.nodes.values().next().value.stats.players
					}\`\`\``,
					inline: true,
				},
				{
					name: "Thông tin hệ thống",
					value: `\`\`\`yml\nOS: ${osVer}\nUptime: ${sysUptime}\nMemory: ${sysMemUsed}MB/${sysMemTotal}MB\`\`\``,
				},
			])
		return interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
	);

module.exports = command;
