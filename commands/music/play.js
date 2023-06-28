const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("ytdl-core");
const {
  createAudioResource,
  createAudioPlayer,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("PLACEHOLDER FOR PLAY SONG")
    .addStringOption((option) => option.setName("song").setDescription("The song you want to play").setRequired(true)),
  async execute(interaction) {
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
    const passthroughStream = ytdl(videoURL, { filter: "audioonly" });
    const dumbChunks = [];

    passthroughStream.on('info', (info, videoFormat) => {
      console.log({ info, videoFormat});
    });
    
    passthroughStream.on('data', chunk => {
      dumbChunks.push(chunk);
    })
    
    passthroughStream.on('end', () => {
      console.log('FUKING DONE BOIIIIIII WE DONE DID IT')

      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      const resource = createAudioResource(passthroughStream);
      const player = createAudioPlayer();
      
      player.play(resource);
      connection.subscribe(player);
      interaction.followUp(`Now playing ${videoURL}`)

      player.on(AudioPlayerStatus.Playing, () => {
        console.log("The audio player has started playing!");
      });

      player.on(AudioPlayerStatus.Paused, () => {
        console.log("The audio player has started PAUSING!");
      });

      player.on("error", (error) => {
        console.error(`Error: ${error}`);
        // player.play(getNextResource());
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
      
    })
  
  
    await interaction.deferReply({ ephemeral: true });
  },
};
