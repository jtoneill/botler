const { SlashCommandBuilder } = require("discord.js");
const { player } = require("../../src/audioPlayer.js");

module.exports = {
  data: new SlashCommandBuilder().setName("stop").setDescription("STOP"),
  async execute(interaction) {
    if (player) {
      player.stop();
    }
    await interaction.reply("Stopping song 🤚🛑🚫");
  },
};
