const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("mostplayed").setDescription("Replies with Bong!"),
  async execute(interaction) {
    await interaction.reply("Bong!");
  },
};
