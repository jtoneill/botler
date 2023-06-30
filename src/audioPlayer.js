const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");

class BotlerAudioPlayer {
  constructor() {
    this.player = createAudioPlayer();
    this.isPlaying = false;
    this.createdAt = new Date().toISOString();

    console.log(`Created new BotlerAudioPlayer instance @${this.createdAt}`);

    this.player.on(AudioPlayerStatus.Playing, () => {
      this.isPlaying = true;
      console.log("Player Status: Playing");
    });

    this.player.on(AudioPlayerStatus.Paused, () => {
      console.log("Player Status: Paused");
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      console.log("Player Status: Idle");
      this.isPlaying = false;

      if (typeof this.idleEventCb === "function") {
        this.idleEventCb(this.player);
      }
    });

    this.player.on("error", (error) => {
      console.error(`Player Status: Error`);
      console.error(`Error: ${error}`);
    });
  }

  setIdleEventCb(idleEventCb) {
    if (!this.idleEventCb) {
      this.idleEventCb = idleEventCb;
    }
  }
}

module.exports = {
  audioPlayer: new BotlerAudioPlayer(),
};
