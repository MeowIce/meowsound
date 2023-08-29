const SlashCommand = require("../../lib/SlashCommand");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { Rlyrics } = require("rlyrics");
const lyricsApi = new Rlyrics();

const command = new SlashCommand()
	.setName("lyrics")
	.setDescription("Lấy lời bài hát.")
	.addStringOption((option) =>
		option
			.setName("value")
			.setDescription("Vui lòng nhập tên nhạc...")
			.setRequired(false),
	)
	.setRun(async (client, interaction, options) => {
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(client.config.embedColor)
					.setDescription("<:inifile:810858845001482290> Đang xử lý..."),
			],
		});
		
		let player;
		if (client.manager) {
			player = client.manager.players.get(interaction.guild.id);
		} else {
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("<:shell32_11:1045304792265793546> Lỗi kết nối Máy chủ âm thanh."),
				],
			});
		}
		
		const args = interaction.options.getString("value");
		if (!args && !player) {
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("<:shell32:1044949839147974696> Không có gì đang phát."),
				],
			});
		}
		
		let currentTitle = ``;
		const phrasesToRemove = [
			"Full Video", "Full Audio", "Official Music Video", "Lyrics", "Lyrical Video",
			"Feat.", "Ft.", "Official", "Audio", "Video", "HD", "4K", "Remix", "Lyric Video", "Lyrics Video", "8K", 
			"High Quality", "Animation Video", "\\(Official Video\\. .*\\)", "\\(Music Video\\. .*\\)", "\\[NCS Release\\]",
		];
		if (!args) {
			currentTitle = player.queue.current.title;
			currentTitle = currentTitle
				.replace(new RegExp(phrasesToRemove.join('|'), 'gi'), '')
				.replace(/\s*([\[\(].*?[\]\)])?\s*(\|.*)?\s*(\*.*)?$/, '');
		}
		let query = args ? args : currentTitle;
		let lyricsResults = [];

		lyricsApi.search(query).then(async (lyricsData) => {
			if (lyricsData.length !== 0) {
				for (let i = 0; i < client.config.lyricsMaxResults; i++) {
					if (lyricsData[i]) {
						lyricsResults.push({
							label: `${lyricsData[i].title}`,
							description: `${lyricsData[i].artist}`,
							value: i.toString()
						});
					} else { break }
				}

				const menu = new MessageActionRow().addComponents(
					new MessageSelectMenu()
						.setCustomId("choose-lyrics")
						.setPlaceholder("Chọn môt bài nhạc...")
						.addOptions(lyricsResults),
				);

				let selectedLyrics = await interaction.editReply({
					embeds: [
						new MessageEmbed()
							.setColor(client.config.embedColor)
							.setDescription(
								`Một số kết quả tìm kiếm cho \`${query}\`. Hãy chọn một bài trong \`30 giây\`.`
							),
					], components: [menu],
				});

				const filter = (button) => button.user.id === interaction.user.id;

				const collector = selectedLyrics.createMessageComponentCollector({
					filter,
					time: 30000,
				});

				collector.on("collect", async (interaction) => {
					if (interaction.isSelectMenu()) {
						await interaction.deferUpdate();
						const url = lyricsData[parseInt(interaction.values[0])].url;

						lyricsApi.find(url).then((lyrics) => {
							let lyricsText = lyrics.lyrics;

							const button = new MessageActionRow()
								.addComponents(
									new MessageButton()
										.setCustomId('tipsbutton')
										.setLabel('Mẹo tìm lyrics')
										.setEmoji(`📌`)
										.setStyle('SECONDARY'),
									new MessageButton()
										.setLabel('Nguồn')
										.setURL(url)
										.setStyle('LINK'),
								);

							const musixmatch_icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Musixmatch_logo_icon_only.svg/480px-Musixmatch_logo_icon_only.svg.png';
							let lyricsEmbed = new MessageEmbed()
								.setColor(client.config.embedColor)
								.setTitle(`${lyrics.name}`)
								.setURL(url)
								.setThumbnail(lyrics.icon)
								.setFooter({
									text: 'Lyrics được cung cấp bởi MusixMatch.',
									iconURL: musixmatch_icon
								})
								.setDescription(lyricsText);

							if (lyricsText.length === 0) {
								lyricsEmbed
									.setDescription(`**Ôi không ! Tôi không thể truy cập lyrics cho bài hát này !**`)
									.setFooter({
										text: 'Lyrics đã bị khóa bởi MusixMatch.',
										iconURL: musixmatch_icon
									})
							}

							if (lyricsText.length > 4096) {
								lyricsText = lyricsText.substring(0, 4050) + "\n\n[...]";
								lyricsEmbed
									.setDescription(lyricsText + `\nĐã cắt bớt vì lyrics quá dài.`)
							}

							return interaction.editReply({
								embeds: [lyricsEmbed],
								components: [button],
							});

						})
					}
				});

				collector.on("end", async (i) => {
					if (i.size == 0) {
						selectedLyrics.edit({
							content: null,
							embeds: [
								new MessageEmbed()
									.setDescription(
										`Bạn đã không chọn bài gì trong 30s !`
									)
									.setColor(client.config.embedColor),
							], components: [],
						});
					}
				});

			} else {
				const button = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setEmoji(`📌`)
							.setCustomId('tipsbutton')
							.setLabel('Mẹo tìm lyrics')
							.setStyle('SECONDARY'),
					);
				return interaction.editReply({
					embeds: [
						new MessageEmbed()
							.setColor("RED")
							.setDescription(
								`Không có kết quả cho \`${query}\` !\nHãy chắc chắn rằng bạn đã nhập chính xác.`,
							),
					], components: [button],
				});
			}
		}).catch((err) => {
			console.error(err);
			return interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription(
							`Lỗi không xác định, check logs.`,
						),
				],
			});
		});

		const collector = interaction.channel.createMessageComponentCollector({
			time: 1000 * 3600
		});

		collector.on('collect', async interaction => {
			if (interaction.customId === 'tipsbutton') {
				await interaction.deferUpdate();
				await interaction.followUp({
					embeds: [
						new MessageEmbed()
							.setTitle(`Lyrics Tips`)
							.setColor(client.config.embedColor)
							.setDescription(
								`Một số mẹo để tìm đúng lyrics: \n\n\
                                1. Hãy thử thêm tên ca sĩ vào trước tên (VD: Justin Bieber - Stay).\n\
                                2. Thử tìm bằng cách thủ công.\n\
                                3. Thử bằng từ khóa khác.`,
							),
					], ephemeral: true, components: []
				});
			};
		});
	});

module.exports = command;
