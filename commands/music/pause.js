const { SlashCommandBuilder } = require("discord.js");
const { audioPlayer } = require("../../src/audioPlayer.js");

module.exports = {
  data: new SlashCommandBuilder().setName("pause").setDescription("PAUSE"),
  async execute(interaction) {
    audioPlayer?.player?.pause();
    await interaction.reply("Pausing song ⏯️");
  },
};
