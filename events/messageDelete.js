/**
 * @param {Client} client
 * @param {Message} message
 */

module.exports = async (client, message) => {
	if (!client.isMessageDeleted(message)) {
		client.markMessageAsDeleted(message);
	}
};
