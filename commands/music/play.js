const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const {
  createAudioResource,
  createAudioPlayer,
  getVoiceConnection,
  NoSubscriberBehavior,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const { createWriteStream, createReadStream } = require('node:fs');
const path = require("node:path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("PLACEHOLDER FOR PLAY SONG")
    .addStringOption((option) => option.setName("song").setDescription("The song you want to play").setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const songName = interaction.options.getString("song");
    const youtubeSearchURL = "https://www.youtube.com/watch?v=";
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${songName}&key=${process.env.YT_TOKEN}`
    );
    const jsonData = await searchResponse.json();
    const videoURL = youtubeSearchURL + jsonData.items[0].id.videoId;
    // const info = await ytdl.getInfo(jsonData.items[0].id.videoId);
    
    // Quality 250 should correspond to a webm format
    // See https://github.com/fent/node-ytdl-core#ytdlchooseformatformats-options
    // ytdl.chooseFormat(info.formats, { quality: "250" });
    
    // ytdl returns a PassThrough stream 
    const passthroughStream = ytdl(videoURL, { filter: "audioonly" })
          .pipe(createWriteStream(path.join(__dirname, `${jsonData.items[0].id.videoId}.mp3`)));

    const voiceConfig = {
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    };

    // This may not be the correct way to go about this
    // but we started to everything
    const streamConnection = getVoiceConnection(interaction.guildId);

    const player = createAudioPlayer();
    const resource = createAudioResource(createReadStream(path.join(__dirname, `${jsonData.items[0].id.videoId}.mp3`)));

    player.play(resource);
    streamConnection.subscribe(player);

    await interaction.followUp(`Now playing ${videoURL}`)

    resource.playStream.on('error', error => {
      console.error('Error:', error.message, 'with track', resource.metadata.title);
    });

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("The audio player has started playing!");
    });

    player.on(AudioPlayerStatus.AutoPaused, () => {
      console.log('AUTO PAUSED BEEP BOOP')
    })
    
    player.on(AudioPlayerStatus.Paused, () => {
      console.log("The audio player has started PAUSING!");
    });
    
    player.on("error", (error) => {
      console.error(`Error: ${error}`);
      // player.play(getNextResource());
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Player Status: Idle')
      // player.play(resource);
    });
    
    streamConnection.on(VoiceConnectionStatus.Ready, () => {
      console.log('The connection has entered the Ready state - ready to play audio!');
    });

    streamConnection.on(VoiceConnectionStatus.Signalling, () => {
      console.log('Requesting to join channel');
    });

    streamConnection.on(VoiceConnectionStatus.Connecting, () => {
      console.log('Got permission! Connecting to channel');
    });

    streamConnection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log('Fuck! We d/cd');
    });

    streamConnection.on(VoiceConnectionStatus.Destroyed, () => {
      console.log('Fuck! DESTROYED');
    });

    streamConnection.on(VoiceConnectionStatus.Error, (error) => {
      console.error('Voice connection error:', error);
    });

    passthroughStream.on('info', (info, videoFormat) => {
      console.log({ info, videoFormat});
    });
  
  },
};
