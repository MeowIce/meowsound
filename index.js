const MeowAudioCoreessor = require("./lib/MeowAudioCore");
const { exec } = require("child_process");

const client = new MeowAudioCoreessor();
module.exports = client;
