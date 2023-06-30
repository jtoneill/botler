const { SlashCommandBuilder } = require("discord.js");
const { queue } = require("../../src/queue");

module.exports = {
  data: new SlashCommandBuilder().setName("shuffle").setDescription("PLACEHOLDER FOR PLAY SONG"),
  async execute(interaction) {
    queue.shufflePlay = !queue.shufflePlay;
    await interaction.reply(`Changing the shuffle play state to ${ queue.shufflePlay ? 'ON' : 'OFF'}`);
  },
};
