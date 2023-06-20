const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("resume").setDescription("PLACEHOLDER FOR PLAY SONG"),
  async execute(interaction) {
    await interaction.reply("Bong!");
  },
};
