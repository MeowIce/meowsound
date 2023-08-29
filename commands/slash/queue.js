const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const escapeMarkdown = require('discord.js').Util.escapeMarkdown;
const load = require("lodash");
const pms = require("pretty-ms");

const command = new SlashCommand()
	.setName("queue")
	.setDescription("Hiển thị hàng chờ hiện tại.")
	
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
						.setDescription("<:shell32:1044949839147974696> Hiện tại không có gì trong hàng chờ."),
				],
				ephemeral: true,
			});
		}
		
		if (!player.playing) {
			const queueEmbed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription("<:shell32:1044949839147974696> Không có gì đang phát.");
			return interaction.reply({ embeds: [queueEmbed], ephemeral: true });
		}
		
		await interaction.deferReply().catch(() => {
		});
        
		
		if (!player.queue.size || player.queue.size === 0) {
            let song = player.queue.current;
            var title = escapeMarkdown(song.title)
            var title = title.replace(/\]/g,"")
            var title = title.replace(/\[/g,"")
			const queueEmbed = new MessageEmbed()
				.setColor(client.config.embedColor)
				.setDescription(`<:shell32_0079:1044613134377300068> Hiện đang phát: [${ title }](${ song.uri })`)
				.addFields(
					{
						name: "Thời lượng",
						value: song.isStream
							? `\`TRỰC TIẾP\``
							: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
								player.queue.current.duration,
								{ colonNotation: true },
							) }\``,
						inline: true,
					},
					{
						name: "Âm lượng",
						value: `\`${ player.volume }\``,
						inline: true,
					},
					{
						name: "Tổng",
						value: `\`${ player.queue.totalSize - 1 }\``,
						colonNotation: true,
						inline: true,
					},
				);
			
			await interaction.editReply({
				embeds: [queueEmbed],
			});
		} else {
			let queueDuration = player.queue.duration.valueOf()
			if (player.queue.current.isStream) {
				queueDuration -= player.queue.current.duration
			}
			for (let i = 0; i < player.queue.length; i++) {
				if (player.queue[i].isStream) {
					queueDuration -= player.queue[i].duration
				}
			}
			
			const mapping = player.queue.map(
				(t, i) => `\` ${ ++i } \` [${ t.title }](${ t.uri }) [${ t.requester }]`,
			);
			
			const chunk = load.chunk(mapping, 10);
			const pages = chunk.map((s) => s.join("\n"));
			let page = interaction.options.getNumber("page");
			if (!page) {
				page = 0;
			}
			if (page) {
				page = page - 1;
			}
			if (page > pages.length) {
				page = 0;
			}
			if (page < 0) {
				page = 0;
			}
			
			if (player.queue.size < 11 || player.queue.totalSize < 11) {
                let song = player.queue.current;
                var title = escapeMarkdown(song.title)
                var title = title.replace(/\]/g,"")
                var title = title.replace(/\[/g,"")
				const embedTwo = new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(
						`<:shell32_0079:1044613134377300068> Hiện đang phát: [${ title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Các bài đang đợi**\n${ pages[page] }`,
					)
					.addFields(
						{
							name: "Thời lượng",
							value: song.isStream
								? `\`TRỰC TIẾP\``
								: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
									player.queue.current.duration,
									{ colonNotation: true },
								) }\``,
							inline: true,
						},
						{
							name: "Tổng thời lượng",
							value: `\`${ pms(queueDuration, {
								colonNotation: true,
							}) }\``,
							inline: true,
						},
						{
							name: "Tổng số bài",
							value: `\`${ player.queue.totalSize - 1 }\``,
							colonNotation: true,
							inline: true,
						},
					)
					.setFooter({
						text: `Trang ${ page + 1 }/${ pages.length }`,
					});
				
				await interaction
					.editReply({
						embeds: [embedTwo],
					})
					.catch(() => {
					});
			} else {
				let song = player.queue.current;
                var title = escapeMarkdown(song.title)
                var title = title.replace(/\]/g,"")
                var title = title.replace(/\[/g,"")
				const embedThree = new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription(
						`<:shell32_0079:1044613134377300068> Hiện đang phát: [${ title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Các bài đang đợi**\n${ pages[page] }`,
					)
					.addFields(
						{
							name: "Thời lượng",
							value: song.isStream
								? `\`TRỰC TIẾP\``
								: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
									player.queue.current.duration,
									{ colonNotation: true },
								) }\``,
							inline: true,
						},
						{
							name: "Tổng thời lượng",
							value: `\`${ pms(queueDuration, {
								colonNotation: true,
							}) }\``,
							inline: true,
						},
						{
							name: "Tổng số bài",
							value: `\`${ player.queue.totalSize - 1 }\``,
							colonNotation: true,
							inline: true,
						},
					)
					.setFooter({
						text: `Trang ${ page + 1 }/${ pages.length }`,
					});
				
				const buttonOne = new MessageButton()
					.setCustomId("queue_cmd_but_1_app")
					.setEmoji("⏭️")
					.setStyle("PRIMARY");
				const buttonTwo = new MessageButton()
					.setCustomId("queue_cmd_but_2_app")
					.setEmoji("⏮️")
					.setStyle("PRIMARY");
				
				await interaction
					.editReply({
						embeds: [embedThree],
						components: [
							new MessageActionRow().addComponents([buttonTwo, buttonOne]),
						],
					})
					.catch(() => {
					});
				
				const collector = interaction.channel.createMessageComponentCollector({
					filter: (b) => {
						if (b.user.id === interaction.user.id) {
							return true;
						} else {
							return b
								.reply({
									content: `<:shell32:1044949817362755615> Chỉ **${ interaction.user.tag }** mới dùng được nút này.`,
									ephemeral: true,
								})
								.catch(() => {
								});
						}
					},
					time: 60000 * 5,
					idle: 30e3,
				});
				
				collector.on("collect", async (button) => {
					if (button.customId === "queue_cmd_but_1_app") {
						await button.deferUpdate().catch(() => {
						});
						page = page + 1 < pages.length? ++page : 0;
                        let song = player.queue.current;
                        var title = escapeMarkdown(song.title)
                        var title = title.replace(/\]/g,"")
                        var title = title.replace(/\[/g,"")
						const embedFour = new MessageEmbed()
							.setColor(client.config.embedColor)
							.setDescription(
								`<:shell32_0079:1044613134377300068> Hiện đang phát: [${ title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Các bài đang đợi**\n${ pages[page] }`,
							)
							.addFields(
								{
									name: "Thời lượng",
									value: song.isStream
										? `\`TRỰC TIẾP\``
										: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
											player.queue.current.duration,
											{ colonNotation: true },
										) }\``,
									inline: true,
								},
								{
									name: "Tổng thời lượng",
									value: `\`${ pms(queueDuration, {
										colonNotation: true,
									}) }\``,
									inline: true,
								},
								{
									name: "Tổng số bài",
									value: `\`${ player.queue.totalSize - 1 }\``,
									colonNotation: true,
									inline: true,
								},
							)
							.setFooter({
								text: `Trang ${ page + 1 }/${ pages.length }`,
							});
						
						await interaction.editReply({
							embeds: [embedFour],
							components: [
								new MessageActionRow().addComponents([buttonTwo, buttonOne]),
							],
						});
					} else if (button.customId === "queue_cmd_but_2_app") {
						await button.deferUpdate().catch(() => {
						});
						page = page > 0? --page : pages.length - 1;
                        let song = player.queue.current;
                        var title = escapeMarkdown(song.title)
                        var title = title.replace(/\]/g,"")
                        var title = title.replace(/\[/g,"")
						const embedFive = new MessageEmbed()
							.setColor(client.config.embedColor)
							.setDescription(
								`<:shell32_0079:1044613134377300068> Hiện đang phát: [${ title }](${ song.uri }) [${ player.queue.current.requester }]\n\n**Các bài đang đợi**\n${ pages[page] }`,
							)
							.addFields(
								{
									name: "Thời lượng",
									value: song.isStream
										? `\`TRỰC TIẾP\``
										: `\`${ pms(player.position, { colonNotation: true }) } / ${ pms(
											player.queue.current.duration,
											{ colonNotation: true },
										) }\``,
									inline: true,
								},
								{
									name: "Tổng thời lượng",
									value: `\`${ pms(queueDuration, {
										colonNotation: true,
									}) }\``,
									inline: true,
								},
								{
									name: "Tổng số bài",
									value: `\`${ player.queue.totalSize - 1 }\``,
									colonNotation: true,
									inline: true,
								},
							)
							.setFooter({
								text: `Trang ${ page + 1 }/${ pages.length }`,
							});
						
						await interaction
							.editReply({
								embeds: [embedFive],
								components: [
									new MessageActionRow().addComponents([buttonTwo, buttonOne]),
								],
							})
							.catch(() => {
							});
					} else {
						return;
					}
				});
			}
		}
	});

module.exports = command;
