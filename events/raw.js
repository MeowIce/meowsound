/**
 *
 * @param {import("../lib/MeowAudioCore")} client
 * @param {*} data
 */
module.exports = (client, data) => {
	client.manager?.updateVoiceState(data);
};
