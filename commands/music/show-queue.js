const { SlashCommandBuilder } = require("discord.js");
const { queue } = require('../../src/queue');

module.exports = {
  data: new SlashCommandBuilder().setName("showqueue").setDescription("PLACEHOLDER FOR PLAY SONG"),
  async execute(interaction) {
    await interaction.reply(queue.showList());
  },
};
