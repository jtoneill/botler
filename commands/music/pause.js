const { SlashCommandBuilder } = require("discord.js");
const { player } = require("../../src/audioPlayer.js");

module.exports = {
  data: new SlashCommandBuilder().setName("pause").setDescription("PAUSE"),
  async execute(interaction) {
    if (player) {
      player.pause();
    }
    await interaction.reply("Pausing song ⏯️");
  },
};
