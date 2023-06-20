const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("autoplay").setDescription("Replies with Bong!"),
  async execute(interaction) {
    await interaction.reply("Bong!");
  },
};
