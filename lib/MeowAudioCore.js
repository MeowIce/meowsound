const {
  Client,
  Intents,
  MessageEmbed,
  Collection,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const escapeMarkdown = require('discord.js').Util.escapeMarkdown;
const fs = require("fs");
const path = require("path");
const prettyMilliseconds = require("pretty-ms");
const { Manager } = require("erela.js");
const ConfigFetcher = require("../util/getConfig");
const Logger = require("./Logger");
const spotify = require("better-erela.js-spotify").default;
const { default: AppleMusic } = require("better-erela.js-apple");
const deezer = require("erela.js-deezer");
const facebook = require("erela.js-facebook");
const getLavalink = require("../util/getLavalink");
const getChannel = require("../util/getChannel");
const colors = require("colors");
const { default: SuperPlayer } = require("./MeowAudioCore");
class MeowAudioCore extends Client {
  /**
   *
   * @param {import("discord.js").ClientOptions} props
   */
  constructor(
    props = {
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
      ],
    }
  ) {
    super(props);

    ConfigFetcher().then((conf) => {
      this.config = conf;
      this.build();
    });

    /**@type {Collection<string, import("./SlashCommand")} 
    * 
    */
    this.slashCommands = new Collection();

    this.logger = new Logger(path.join(__dirname, "..", "logs.log"));

    this.LoadCommands();
    this.LoadEvents();

    this.deletedMessages = new WeakSet();
    this.getLavalink = getLavalink;
    this.getChannel = getChannel;
    this.ms = prettyMilliseconds;
    this.commandsRan = 0;
    this.songsPlayed = 0;
  }

  /**
   * Send an info message
   * @param {string} text
   */
  log(text) {
    this.logger.log(text);
  }

  /**
   * Send an warning message
   * @param {string} text
   */
  warn(text) {
    this.logger.warn(text);
  }

  /**
   * Send an error message
   * @param {string} text
   */
  error(text) {
    this.logger.error(text);
  }

  build() {
    this.warn("[MeowSound] Starting...");
    this.login(this.config.token);
    if (this.config.debug === true) {
      this.warn("Entering DEBUG MODE...");
      process.on("unhandledRejection", (error) => console.log(error));
      process.on("uncaughtException", (error) => console.log(error));
    } else {
      process.on("unhandledRejection", (error) => {
        return;
      });
      process.on("uncaughtException", (error) => {
        return;
      });
    }

    let client = this;
    let playedTracks = [];

    this.manager = new Manager({
      plugins: [
        new deezer(),
        new AppleMusic(),
        new spotify(),
        new facebook(),
      ],
      autoPlay: true,
      nodes: this.config.nodes,
      retryDelay: this.config.retryDelay,
      retryAmount: this.config.retryAmount,
      clientName: `MeowSound`,
      send: (id, payload) => {
        let guild = client.guilds.cache.get(id);
        if (guild) {
          guild.shard.send(payload);
        }
      },
    })
      .on("nodeConnect", (node) =>
        this.log(
          `Node: ${node.options.identifier} | Lavalink node is connected.`
        )
      )
      .on("nodeReconnect", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node is reconnecting.`
        )
      )
      .on("nodeDestroy", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node is destroyed.`
        )
      )
      .on("nodeDisconnect", (node) =>
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node is disconnected.`
        )
      )
      .on("nodeError", (node, err) => {
        this.warn(
          `Node: ${node.options.identifier} | Lavalink node has an error: ${err.message}.`
        );
      })
      .on("trackError", (player, err) => {
        this.warn(
          `Player: ${player.options.guild} | Track had an error: ${err.message}.`
        );
        let song = player.queue.current;
        var title = escapeMarkdown(song.title)
        var title = title.replace(/\]/g,"")
        var title = title.replace(/\[/g,"")
        
        let errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("Đã có lỗi khi phát lại...")
          .setDescription(`Không thể load: \`${title}\``)
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [errorEmbed] });
      })

      .on("trackStuck", (player, err) => {
        this.warn(`File đã có lỗi: ${err.message}`);
        let song = player.queue.current;
        var title = escapeMarkdown(song.title)
        var title = title.replace(/\]/g,"")
        var title = title.replace(/\[/g,"")
        
        let errorEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("Đã có lỗi khi phát lại...")
          .setDescription(`Không thể load: \`${title}\``)
        client.channels.cache
          .get(player.textChannel)
          .send({ embeds: [errorEmbed] });
      })
      .on("playerMove", (player, oldChannel, newChannel) => {
        const guild = client.guilds.cache.get(player.guild);
        if (!guild) {
          return;
        }
        const channel = guild.channels.cache.get(player.textChannel);
        if (oldChannel === newChannel) {
          return;
        }
        if (newChannel === null || !newChannel) {
          if (!player) {
            return;
          }
          if (channel) {
            channel.send({
              embeds: [
                new MessageEmbed()
                  .setColor(client.config.embedColor)
                  .setDescription(`Ngắt kết nối khỏi <#${oldChannel}>`),
              ],
            });
          }
          return player.destroy();
        } else {
          player.voiceChannel = newChannel;
          setTimeout(() => player.pause(false), 1000);
          return undefined;
        }
      })
      .on("playerCreate", (player) => {
        player.set("twentyFourSeven", client.config.twentyFourSeven);
        player.set("autoQueue", client.config.autoQueue);
        player.set("autoPause", client.config.autoPause);
        this.warn(
          `Player: ${
            player.options.guild
          } | A new player has been created in ${
            client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "an unknown guild"
          }`
        );
      })
      .on("playerDestroy", (player) =>
        this.warn(
          `Player: ${player.options.guild} | A player has been destroyed in ${client.guilds.cache.get(player.options.guild)
              ? client.guilds.cache.get(player.options.guild).name
              : "an unknown guild"
          }`
        )
      )
      .on("loadFailed", (node, type, error) =>
        this.warn(
          `Node: ${node.options.identifier} | Failed to load ${type}: ${error.message}`
        )
      )
      
      .on(
        "trackStart",
        /** @param {SuperPlayer} player */ async (player, track) => {
          this.songsPlayed++;
          playedTracks.push(track.identifier);
          if (playedTracks.length >= 100) {
            playedTracks.shift();
          }

          this.warn(
            `Player: ${
              player.options.guild
            } | Track has been started playing [${colors.blue(track.title)}]`
          );
            var title = escapeMarkdown(track.title)
            var title = title.replace(/\]/g,"")
            var title = title.replace(/\[/g,"")
          let trackStartedEmbed = this.Embed()
            .setAuthor({ name: "Hiện đang phát...", iconURL: this.config.iconURL })
            .setDescription(
              `[${title}](${track.uri})` || "Không có t.tin"
            )
            .addFields(
              {
                name: "Được yêu cầu bởi",
                value: `${track.requester || `<@${client.user.id}>`}`,
                inline: true,
              },
              {
                name: "Thời lượng",
                value: track.isStream
                  ? `\`TRỰC TIẾP\``
                  : `\`${prettyMilliseconds(track.duration, {
                      colonNotation: true,
                    })}\``,
                inline: true,
              }
            );
          try {
            trackStartedEmbed.setThumbnail(
              track.displayThumbnail("maxresdefault")
            );
          } catch (err) {
            trackStartedEmbed.setThumbnail(track.thumbnail);
          }
          let nowPlaying = await client.channels.cache
            .get(player.textChannel)
            .send({
              embeds: [trackStartedEmbed],
              components: [
                client.createController(player.options.guild, player),
              ],
            })
            .catch(this.warn);
          player.setNowplayingMessage(client, nowPlaying);
       }
      )
      .on(
        "playerDisconnect",
          /** @param {SuperPlayer} */ async (player) => {
            if (player.twentyFourSeven) {
              player.queue.clear();
              player.stop();
              player.set("autoQueue", false);
            } else {
              player.destroy();
            }
            player.setNowplayingMessage(client, null);
          }
      )

      .on(
        "queueEnd",
        /** @param {SuperPlayer} */ async (player, track) => {
          const autoQueue = player.get("autoQueue");

          if (autoQueue) {
            const requester = player.get("requester");
            const identifier = track.identifier;
            const search = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
            const res = await player.search(search, requester);
            let nextTrackIndex;

            res.tracks.some((track, index) => {
              nextTrackIndex = index;
              return !playedTracks.includes(track.identifier);
            });

            if (res.exception) {
              client.channels.cache.get(player.textChannel).send({
                embeds: [
                  new MessageEmbed()
                    .setColor("RED")
                    .setAuthor({
                      name: `${res.exception.severity}`,
                      iconURL: client.config.iconURL,
                    })
                    .setDescription(
                      `Không thể load.\n${res.exception.message}`
                    ),
                ],
              });
              return player.destroy();
            }

            player.play(res.tracks[nextTrackIndex]);
            player.queue.previous = track;
          } else {
            const twentyFourSeven = player.get("twentyFourSeven");

            let queueEmbed = new MessageEmbed()
              .setColor(client.config.embedColor)
              .setAuthor({
                name: "Hàng đợi đã kết thúc.",
                iconURL: client.config.iconURLStopped,
              })
              .setTimestamp();
            let EndQueue = await client.channels.cache
              .get(player.textChannel)
              .send({ embeds: [queueEmbed] });
            setTimeout(() => EndQueue.delete(true), 5000);
            try {
              if (!player.playing && !twentyFourSeven) {
                setTimeout(async () => {
                  if (!player.playing && player.state !== "DISCONNECTED") {
                    let disconnectedEmbed = new MessageEmbed()
                      .setColor(client.config.embedColor)
                      .setAuthor({
                        name: "Đã ngắt kết nối !",
                        iconURL: client.config.iconURL,
                      })
                      .setDescription(
                        `Trình phát đã bị ngắt kết nối do không hoạt động.`
                      );
                    let Disconnected = await client.channels.cache
                      .get(player.textChannel)
                      .send({ embeds: [disconnectedEmbed] });
                    setTimeout(() => Disconnected.delete(true), 6000);
                    player.destroy();
                  } else if (player.playing) {
                    client.warn(
                      `Trình phát: ${player.options.guild} | Đang phát...`
                    );
                  }
                }, client.config.disconnectTime);
              } else if (!player.playing && twentyFourSeven) {
                client.warn(
                  `Trình phát: ${
                    player.options.guild
                  } | Hàng đợi đã kết thúc [${colors.blue("24/7")}]`
                );
              } else {
                client.warn(
                  `Đã có lỗi kh mong muốn xảy ra ${player.options.guild}`
                );
              }
              player.setNowplayingMessage(client, null);
            } catch (err) {
              client.error(err);
            }
          }
        }
      );
  }

  /**
   * Checks if a message has been deleted during the run time of the Bot
   * @param {Message} message
   * @returns
   */
  isMessageDeleted(message) {
    return this.deletedMessages.has(message);
  }

  /**
   * Marks (adds) a message on the client's `deletedMessages` WeakSet so it's
   * state can be seen through the code
   * @param {Message} message
   */
  markMessageAsDeleted(message) {
    this.deletedMessages.add(message);
  }

  /**
   *
   * @param {string} text
   * @returns {MessageEmbed}
   */
  Embed(text) {
    let embed = new MessageEmbed().setColor(this.config.embedColor);

    if (text) {
      embed.setDescription(text);
    }

    return embed;
  }

  /**
   *
   * @param {string} text
   * @returns {MessageEmbed}
   */
  ErrorEmbed(text) {
    let embed = new MessageEmbed()
      .setColor("RED")
      .setDescription("<:WerFault:810894263809867796> " + text);

    return embed;
  }

  LoadEvents() {
    let EventsDir = path.join(__dirname, "..", "events");
    fs.readdir(EventsDir, (err, files) => {
      if (err) {
        throw err;
      } else {
        files.forEach((file) => {
          const event = require(EventsDir + "/" + file);
          this.on(file.split(".")[0], event.bind(null, this));
          this.warn("Event Loaded: " + file.split(".")[0]);
        });
      }
    });
  }

  LoadCommands() {
    let SlashCommandsDirectory = path.join(
      __dirname,
      "..",
      "commands",
      "slash"
    );
    fs.readdir(SlashCommandsDirectory, (err, files) => {
      if (err) {
        throw err;
      } else {
        files.forEach((file) => {
          let cmd = require(SlashCommandsDirectory + "/" + file);

          if (!cmd || !cmd.run) {
            return this.warn(
              "Unable to load Command: " +
                file.split(".")[0] +
                ", File doesn't have an valid command with run function"
            );
          }
          this.slashCommands.set(file.split(".")[0].toLowerCase(), cmd);
          this.log("Slash Command Loaded: " + file.split(".")[0]);
        });
      }
    });
  }

  /**
   *
   * @param {import("discord.js").TextChannel} textChannel
   * @param {import("discord.js").VoiceChannel} voiceChannel
   */
  createPlayer(textChannel, voiceChannel) {
    return this.manager.create({
      guild: textChannel.guild.id,
      voiceChannel: voiceChannel.id,
      textChannel: textChannel.id,
      selfDeafen: this.config.serverDeafen,
      volume: this.config.defaultVolume,
    });
  }

  createController(guild, player) {
    return new MessageActionRow().addComponents(
      new MessageButton()
        .setStyle("DANGER")
        .setCustomId(`controller:${guild}:Stop`)
        .setEmoji("⏹️"),

      new MessageButton()
        .setStyle("PRIMARY")
        .setCustomId(`controller:${guild}:Replay`)
        .setEmoji("⏮️"),

      new MessageButton()
        .setStyle(player.playing ? "PRIMARY" : "DANGER")
        .setCustomId(`controller:${guild}:PlayAndPause`)
        .setEmoji(player.playing ? "⏸️" : "▶️"),

      new MessageButton()
        .setStyle("PRIMARY")
        .setCustomId(`controller:${guild}:Next`)
        .setEmoji("⏭️"),

      new MessageButton()
        .setStyle(
          player.trackRepeat
            ? "SUCCESS"
            : player.queueRepeat
            ? "SUCCESS"
            : "DANGER"
        )
        .setCustomId(`controller:${guild}:Loop`)
        .setEmoji(player.trackRepeat ? "🔂" : player.queueRepeat ? "🔁" : "🔁")
    );
  }
}

module.exports = MeowAudioCore;
