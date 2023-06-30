const { SlashCommandBuilder } = require("discord.js");
const { audioPlayer } = require("../../src/audioPlayer.js");

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("RESUME"),
  async execute(interaction) {
    audioPlayer?.player?.pause();
    await interaction.reply("Resuming song ⏯️");
  },
};
