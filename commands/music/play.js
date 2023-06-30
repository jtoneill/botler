const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const { createAudioResource, joinVoiceChannel, VoiceConnectionStatus } = require("@discordjs/voice");
const { audioPlayer } = require("../../src/audioPlayer");
const { queue } = require("../../src/queue");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play")
    .addStringOption((option) =>
      option.setName("song").setDescription("PLAY A SONG FROM A POPULAR STREAMING PLATFORM").setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const songName = interaction.options.getString("song");
    const youtubeSearchURL = "https://www.youtube.com/watch?v=";
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${songName}&key=${process.env.YT_TOKEN}`
    );
    const jsonData = await searchResponse.json();
    const videoURL = youtubeSearchURL + jsonData.items[0].id.videoId;
    const info = await ytdl.getInfo(videoURL);

    if (!audioPlayer?.isPlaying) {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      let resource = createAudioResource(ytdl(videoURL, { filter: "audioonly" }));
      audioPlayer?.player?.play(resource);

      interaction.followUp(`
Now playing:
🎶 ${info?.videoDetails?.title} 🎶 🔊
${videoURL}
      `);
      connection.subscribe(audioPlayer.player);

      audioPlayer.setIdleEventCb((player) => {
        if (queue.songs.length) {
          const nextSong = queue.dequeue(queue.shufflePlay);
          resource = createAudioResource(ytdl(nextSong.url, { filter: "audioonly" }));
          interaction.followUp(`
Now playing:
🎶 ${nextSong.name} 🎶 🔊
${nextSong.url}
          `);
          player.play(resource);
        }
      });

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
      queue.add({ name: info?.videoDetails?.title, url: videoURL });
      interaction.followUp(`A song is currently playing.
Adding to queue: ${info?.videoDetails?.title}`);
    }
  },
};
