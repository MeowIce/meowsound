const SlashCommand = require("../../lib/SlashCommand");
const prettyMilliseconds = require("pretty-ms");
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");

const command = new SlashCommand()
  .setName("search")
  .setDescription("Tìm kiếm một bài nhạc.")
  .addStringOption((option) =>
    option
      .setName("what")
      .setDescription("Tìm cái gì...")
      .setRequired(true)
  )
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    let player;
    if (client.manager) {
      player = client.createPlayer(interaction.channel, channel);
		} else {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription("<:shell32_11:1045304792265793546> Lỗi kết nối Máy chủ âm thanh."),
				],
			});
		}
    await interaction.deferReply().catch((_) => {});

    if (player.state !== "CONNECTED") {
      player.connect();
    }

    const search = interaction.options.getString("what");
    let res;

    try {
      res = await player.search(search, interaction.user);
      if (res.loadType === "LOAD_FAILED") {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setDescription("<:shell32:1044949803118886932> Đã có lỗi xảy ra khi thực hiện tìm kiếm.")
              .setColor("RED"),
          ],
          ephemeral: true,
        });
      }
    } catch (err) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: "<:shell32:1044949803118886932> Đã có lỗi xảy ra khi thực hiện tìm kiếm.",
            })
            .setColor("RED"),
        ],
        ephemeral: true,
      });
    }

    if (res.loadType == "NO_MATCHES") {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setDescription(`<:shell32:1044949839147974696> Không có kết quả cho \`${search}\``)
            .setColor("RED"),
        ],
        ephemeral: true,
      });
    } else {
      let max = 10;
      if (res.tracks.length < max) {
        max = res.tracks.length;
      }

      let resultFromSearch = [];

      res.tracks.slice(0, max).map((track) => {
        resultFromSearch.push({
          label: `${track.title}`,
          value: `${track.uri}`,
          description: track.isStream
            ? `TRỰC TIẾP`
            : `${prettyMilliseconds(track.duration, {
                secondsDecimalDigits: 0,
              })} - ${track.author}`,
        });
      });

      const menus = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("select")
          .setPlaceholder("Chọn một bài...")
          .addOptions(resultFromSearch)
      );

      let choosenTracks = await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embedColor)
            .setDescription(
              `<:shell32:1044949834639093770> Các kquả cho \`${search}\`. Vui lòng chọn trong **30s**`
            ),
        ],
        components: [menus],
      });
      const filter = (button) => button.user.id === interaction.user.id;

      const tracksCollector = choosenTracks.createMessageComponentCollector({
        filter,
        time: 30000,
      });
      tracksCollector.on("collect", async (i) => {
        if (i.isSelectMenu()) {
          await i.deferUpdate();
          let uriFromCollector = i.values[0];
          let trackForPlay;

          trackForPlay = await player?.search(
            uriFromCollector,
            interaction.user
          );
          player?.queue?.add(trackForPlay.tracks[0]);
          if (!player?.playing && !player?.paused && !player?.queue?.size) {
            player?.play();
          }
          i.editReply({
            content: null,
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: "Đã thêm vào hành chờ",
                  iconURL: client.config.iconURLAddedQueue,
                })
                .setURL(res.tracks[0].uri)
                .setThumbnail(res.tracks[0].displayThumbnail("maxresdefault"))
                .setDescription(
                  `[${trackForPlay?.tracks[0]?.title}](${trackForPlay?.tracks[0].uri})` ||
                    "Không tiêu đề"
                )
                .addFields(
                  {
                    name: "Được thêm bởi",
                    value: `<@${interaction.user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Thời lượng",
                    value: res.tracks[0].isStream
                      ? `\`TRỰC TIẾP\``
                      : `\`${client.ms(res.tracks[0].duration, {
                          colonNotation: true,
                        })}\``,
                    inline: true,
                  }
                )
                .setColor(client.config.embedColor),
            ],
            components: [],
          });
        }
      });
      tracksCollector.on("end", async (i) => {
        if (i.size == 0) {
          choosenTracks.edit({
            content: null,
            embeds: [
              new MessageEmbed()
                .setDescription(
                  `<:accessibilitycpl:1044949848341893202> Đã hết thời gian chọn bài.`
                )
                .setColor(client.config.embedColor),
            ],
            components: [],
          });
        }
      });
    }
  });

module.exports = command;
