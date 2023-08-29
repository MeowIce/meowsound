const SlashCommand = require("../../lib/SlashCommand");
const { MessageEmbed } = require("discord.js");
const escapeMarkdown = require('discord.js').Util.escapeMarkdown;

const command = new SlashCommand()
  .setName("play")
  .setDescription(
    "Tìm và phát nhạc từ các nguồn lưu trữ khác nhau."
  )
  .addStringOption((option) =>
    option
      .setName("what")
      .setDescription("Phát cái gì...")
      .setRequired(true)
      .setAutocomplete(true)
  )
  .setRun(async (client, interaction, options) => {
    let channel = await client.getChannel(client, interaction);
    if (!channel) {
      return;
    }

    let node = await client.getLavalink(client);
    if (!node) {
      return interaction.reply({
        embeds: [client.ErrorEmbed("Lavalink chưa được kết nối !")],
      });
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

    if (player.state !== "CONNECTED") {
      player.connect();
    }

    if (channel.type == "GUILD_STAGE_VOICE") {
      setTimeout(() => {
        if (interaction.guild.members.voice.suppress == true) {
          try {
            interaction.guild.members.voice.setSuppressed(false);
          } catch (e) {
            interaction.guild.members.voice.setRequestToSpeak(true);
          }
        }
      }, 2000);
    }

    const ret = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(client.config.embedColor)
          .setDescription("<:shell32:1044949799276920832> Vui lòng chờ..."),
      ],
      fetchReply: true,
    });

    let query = options.getString("what", true);
    let res = await player.search(query, interaction.user).catch((err) => {
      client.error(err);
      return {
        loadType: "LOAD_FAILED",
      };
    });

    if (res.loadType === "LOAD_FAILED") {
      if (!player.queue.current) {
        player.destroy();
      }
      await interaction
        .editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription("<:shell32:1044949795338457128> Đã có lỗi khi thực hiện tìm kiếm."),
          ],
        })
        .catch(this.warn);
    }

    if (res.loadType === "NO_MATCHES") {
      if (!player.queue.current) {
        player.destroy();
      }
      await interaction
        .editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setDescription("<:shell32:1044949803118886932> Không tìm thấy kết quả nào."),
          ],
        })
        .catch(this.warn);
    }

    if (res.loadType === "TRACK_LOADED" || res.loadType === "SEARCH_RESULT") {
      player.queue.add(res.tracks[0]);

      if (!player.playing && !player.paused && !player.queue.size) {
        player.play();
      }
      var title = escapeMarkdown(res.tracks[0].title);
      var title = title.replace(/\]/g, "");
      var title = title.replace(/\[/g, "");
      let addQueueEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setAuthor({ name: "Đã thêm vào hàng chờ:", iconURL: client.config.iconURLAddedQueue })
        .setDescription(
          `[${title}](${res.tracks[0].uri})` || "Không tiêu đề"
        )
        .setURL(res.tracks[0].uri)
        .addFields(
          {
            name: "Được thêm vào bởi",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: "Thời lượng",
            value: res.tracks[0].isStream
              ? `\`TRỰC TIẾP \``
              : `\`${client.ms(res.tracks[0].duration, {
                  colonNotation: true,
                  secondsDecimalDigits: 0,
                })}\``,
            inline: true,
          }
        );

      try {
        addQueueEmbed.setThumbnail(
          res.tracks[0].displayThumbnail("maxresdefault")
        );
      } catch (err) {
        addQueueEmbed.setThumbnail(res.tracks[0].thumbnail);
      }

      if (player.queue.totalSize > 1) {
        addQueueEmbed.addFields({
          name: "Vị trí trong hàng chờ:",
          value: `${player.queue.size}`,
          inline: true,
        });
      } else {
        player.queue.previous = player.queue.current;
      }

      await interaction.editReply({ embeds: [addQueueEmbed] }).catch(this.warn);
    }

    if (res.loadType === "PLAYLIST_LOADED") {
      player.queue.add(res.tracks);

      if (
        !player.playing &&
        !player.paused &&
        player.queue.totalSize === res.tracks.length
      ) {
        player.play();
      }

      let playlistEmbed = new MessageEmbed()
        .setColor(client.config.embedColor)
        .setAuthor({
          name: "DS Phát đã được thêm vào hàng chờ:",
          iconURL: client.config.iconURLAddedQueue,
        })
        .setThumbnail(res.tracks[0].thumbnail)
        .setDescription(`[${res.playlist.name}](${query})`)
        .addFields(
          {
            name: "Đã trong hàng chờ",
            value: `\`${res.tracks.length}\` bài`,
            inline: true,
          },
          {
            name: "Thời lượng DS Phát",
            value: `\`${client.ms(res.playlist.duration, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}\``,
            inline: true,
          }
        );

      await interaction.editReply({ embeds: [playlistEmbed] }).catch(this.warn);
    }

    if (ret) setTimeout(() => ret.delete().catch(this.warn), 20000);
    return ret;
  });

module.exports = command;
