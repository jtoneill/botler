const { createReadStream, createWriteStream, existsSync } = require("node:fs");
const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const { createAudioResource, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const { audioPlayer } = require("../../src/audioPlayer");
const { queue } = require("../../src/queue");
const { spawn } = require("node:child_process");
const pathToFfmpeg = require("ffmpeg-static");
const path = require("node:path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowjam")
    .setDescription("SLOW JAM")
    .addStringOption((option) =>
      option.setName("song").setDescription("PLAY A SLOWWWWWW SONG FROM A POPULAR STREAMING PLATFORM").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const songName = interaction.options.getString("song");
    const youtubeSearchURL = "https://www.youtube.com/watch?v=";
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(songName)}&key=${process.env.YT_TOKEN}`
    );

    const jsonData = await searchResponse.json();
    console.log({ jsonData });
    const videoURL = youtubeSearchURL + jsonData.items[0].id.videoId;
    const info = await ytdl.getInfo(videoURL);

    if (!audioPlayer?.isPlaying) {
      if (existsSync(path.join(__dirname, `../../lib/${jsonData.items[0].id.videoId}-slow.mp3`))) {
        console.log("FILE EXISTS ALREADY");
        console.log("time to slowly jam!!!");
        let resource = createAudioResource(
          createReadStream(path.join(__dirname, `../../lib/${jsonData.items[0].id.videoId}-slow.mp3`))
        );
        audioPlayer?.player?.play(resource);

        interaction.followUp(`
Now SLLLOOOOWWWWWW playing:
🐌🐌🐌🐌🐌🐌🐌🐌
🦥🦥🦥🦥🦥🦥🦥🦥
🎶 ${info?.videoDetails?.title} 🎶 🔊
${videoURL}
🐌🐌🐌🐌🐌🐌🐌🐌
🦥🦥🦥🦥🦥🦥🦥🦥
        `);

        const connection = joinVoiceChannel({
          channelId: interaction.member.voice.channelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection.subscribe(audioPlayer.player);

        connection.on(VoiceConnectionStatus.Ready, () => {
          console.log("The connection has entered the Ready state - ready to play audio!");
        });

        connection.on(VoiceConnectionStatus.Signalling, () => {
          console.log("Requesting to join channel");
        });

        connection.on(VoiceConnectionStatus.Connecting, () => {
          console.log("Got permission! Connecting to channel");
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
          console.log("Fuck! We d/cd");
        });

        connection.on(VoiceConnectionStatus.Destroyed, () => {
          console.log("Fuck! DESTROYED");
        });

        connection.on(VoiceConnectionStatus.Error, (error) => {
          console.error("Voice connection error:", error);
        });
      } else {
        const audioFile = ytdl(videoURL, { filter: "audioonly" }).pipe(
          createWriteStream(path.join(__dirname, `../../lib/${jsonData.items[0].id.videoId}.mp3`))
        );

        console.log({ audioFile });

        audioFile.on("finish", function () {
          console.log("File write complete.");

          const ffArgs = [
            "-i",
            path.join(__dirname, `../../lib/${jsonData.items[0].id.videoId}.mp3`),
            "-filter:a",
            `rubberband=pitch=0.8, rubberband=tempo=0.66`,
            path.join(__dirname, `../../lib/${jsonData.items[0].id.videoId}-slow.mp3`),
          ];

          const ff = spawn(pathToFfmpeg, ffArgs);

          ff.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
          });

          ff.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
          });

          ff.on("close", () => {
            console.log("time to slowly jam???");
            let resource = createAudioResource(
              createReadStream(path.join(__dirname, `../../lib/${jsonData.items[0].id.videoId}-slow.mp3`))
            );
            audioPlayer?.player?.play(resource);

            interaction.followUp(`
    Now SLLLOOOOWWWWWW playing:
    🐌🐌🐌🐌🐌🐌🐌🐌
    🦥🦥🦥🦥🦥🦥🦥🦥
    🎶 ${info?.videoDetails?.title} 🎶 🔊
    ${videoURL}
    🐌🐌🐌🐌🐌🐌🐌🐌
    🦥🦥🦥🦥🦥🦥🦥🦥
        `);
          });
        });

        const connection = joinVoiceChannel({
          channelId: interaction.member.voice.channelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        connection.subscribe(audioPlayer.player);

        connection.on(VoiceConnectionStatus.Ready, () => {
          console.log("The connection has entered the Ready state - ready to play audio!");
        });

        connection.on(VoiceConnectionStatus.Signalling, () => {
          console.log("Requesting to join channel");
        });

        connection.on(VoiceConnectionStatus.Connecting, () => {
          console.log("Got permission! Connecting to channel");
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
          console.log("Fuck! We d/cd");
        });

        connection.on(VoiceConnectionStatus.Destroyed, () => {
          console.log("Fuck! DESTROYED");
        });

        connection.on(VoiceConnectionStatus.Error, (error) => {
          console.error("Voice connection error:", error);
        });
      }
    }
  },
};
