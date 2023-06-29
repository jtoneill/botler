const { SlashCommandBuilder } = require("discord.js");
const { player } = require("../../src/audioPlayer.js");

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("RESUME"),
  async execute(interaction) {
    if (player) {
      player.unpause();
    }
    await interaction.reply("Resuming song ⏯️");
  },
};
