const { SlashCommandBuilder } = require("discord.js");
const { audioPlayer } = require("../../src/audioPlayer.js");

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("STOP"),
  async execute(interaction) {
    audioPlayer?.player?.stop();
    await interaction.reply("Stopping song 🤚🛑🚫");
  },
};
