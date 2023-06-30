const { createAudioPlayer } = require("@discordjs/voice");

const player = createAudioPlayer();
let isPlaying = false;

module.exports = { player, isPlaying };