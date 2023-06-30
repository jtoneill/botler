const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const {
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
let { isPlaying, player } = require("../../src/audioPlayer");
const { queue } = require('../../src/queue')

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

    if (!isPlaying) {
  
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
  
      let resource = createAudioResource(ytdl(videoURL, { filter: "audioonly" }));
      player.play(resource);
  
      interaction.followUp(`Now playing ${videoURL} 🔊`);
      connection.subscribe(player);
      
      player.on(AudioPlayerStatus.Playing, () => {
        isPlaying = true;
        console.log("The audio player has started playing!");
      });
  
      player.on(AudioPlayerStatus.Paused, () => {
        console.log("The audio player has started PAUSING!");
      });
  
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Player Status: Idle');
        isPlaying = false;
        if (queue.songs.length) {
          const nextSongURL = queue.dequeue(queue.shufflePlay);
          resource = createAudioResource(ytdl(nextSongURL, { filter: "audioonly" }));
          interaction.followUp(`Now playing ${nextSongURL} 🔊`);
          player.play(resource);
        }
      });
  
      player.on("error", (error) => {
        console.error(`Error: ${error}`);
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

    } else {
      queue.add(videoURL);
      interaction.followUp(`A song is already playing. Adding ${videoURL} to the queue 🚂`);
    }
  },
};
