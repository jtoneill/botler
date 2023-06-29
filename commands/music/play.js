const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const {
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const { player } = require("../../src/audioPlayer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play")
    .addStringOption((option) => option.setName("song").setDescription("PLAY A SONG FROM A POPULAR STREAMING PLATFORM").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const songName = interaction.options.getString("song");
    const youtubeSearchURL = "https://www.youtube.com/watch?v=";
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${songName}&key=${process.env.YT_TOKEN}`
    );
    const jsonData = await searchResponse.json();
    const videoURL = youtubeSearchURL + jsonData.items[0].id.videoId;

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const resource = createAudioResource(ytdl(videoURL, { filter: "audioonly" }));
    
    player.play(resource);
    connection.subscribe(player);
    interaction.followUp(`Now playing ${videoURL} 🔊`)

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("The audio player has started playing!");
    });

    player.on(AudioPlayerStatus.Paused, () => {
      console.log("The audio player has started PAUSING!");
    });

    player.on("error", (error) => {
      console.error(`Error: ${error}`);
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Player Status: Idle')
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('The connection has entered the Ready state - ready to play audio!');
    });

    connection.on(VoiceConnectionStatus.Signalling, () => {
      console.log('Requesting to join channel');
    });

    connection.on(VoiceConnectionStatus.Connecting, () => {
      console.log('Got permission! Connecting to channel');
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log('Fuck! We d/cd');
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log('Fuck! DESTROYED');
    });

    connection.on(VoiceConnectionStatus.Error, (error) => {
      console.error('Voice connection error:', error);
    });
  },
};
