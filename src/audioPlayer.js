const { createAudioPlayer } = require("@discordjs/voice");

const player = createAudioPlayer();

module.exports = { player };