/**
 *
 * @param {import("../lib/MeowAudioCore")} client
 */
module.exports = (client) => {
	client.manager?.init(client.user.id);
	client.user.setPresence(client.config.presence);
	client.log("Logged in as " + client.user.tag);
};
