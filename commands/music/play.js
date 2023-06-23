const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const { createAudioResource, createAudioPlayer, joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("PLACEHOLDER FOR PLAY SONG")
    .addStringOption((option) => option.setName("song").setDescription("The song you want to play").setRequired(true)),
  async execute(interaction) {
    const songName = interaction.options.getString("song");
    const youtubeSearchURL = "https://www.youtube.com/watch?v=";
    // console.log({ token: process.env.YT_TOKEN });
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${songName}&key=${process.env.YT_TOKEN}`
    );
    const jsonData = await searchResponse.json();
    // console.log(jsonData);
    const videoURL = youtubeSearchURL + jsonData.items[0].id.videoId;
    const info = await ytdl.getInfo(jsonData.items[0].id.videoId);

    const connection = joinVoiceChannel({
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    console.log({ guild: interaction.member.guild });

    ytdl.chooseFormat(info.formats, { quality: "249" });
    const stream = ytdl(videoURL, { filter: "audioonly" });
    console.log({ stream });
    // const resource = createAudioResource("video.ogg");
    // const player = createAudioPlayer();

    // player.play(resource);
    // connection.subscribe(player);

    // console.log({ format });
    // const videoStream = await ytdl(videoURL);

    // console.log({ videoStream });

    // if (songName) {
    //   await interaction.reply(songName);
    // }
  },
};
