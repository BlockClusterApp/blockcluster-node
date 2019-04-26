const { RequestTypes } = require('../../../helpers/requests');

/**
 * @typedef NotificationEvent
 * @property {string} channelName Name of the channel
 * @property {string} chaincodeName Name of the chaincode
 * @property {string} chaincodeEventName Event name on which the notification is triggered
 * @property {string} notificationURL URL at which the webhook is sent
 */

/**
 *
 * @namespace Notification
 */
module.exports = node => ({
  /**
   * Adds a notfication URL to a chaincode event on a particular channel
   * @function
   * @name add
   * @param  {object} options Parameters
   * @property {string} options.chaincodeName Name of the chaincode where notification is to be added
   * @property {string} options.channelName Name of the channel where chaincode is instantiated
   * @property {string} options.chaincodeEventName Name of the chaincode event on which notification is to be triggered
   * @property {string} options.notificationURL URL where the notification is to be sent
   * @return {string} Response from server
   * @memberof Notification
   * @method
   * @instance
   */
  async add({ chaincodeName, channelName, chaincodeEventName, notificationURL }) {
    if (!chaincodeName) {
      throw new Error('Notification add error : chaincodeName is required');
    }

    if (!channelName) {
      throw new Error('Notification add error : chaincodeName is required');
    }

    if (!chaincodeEventName) {
      throw new Error('Notification add error : chaincodeEventName is required');
    }

    if (!notificationURL) {
      throw new Error('Notification add error : notificationURL is required');
    }

    const res = await node.__constructNodeRequest('/notifications/add', RequestTypes.POST, {
      chaincodeName,
      channelName,
      chaincodeEventName,
      notificationURL,
    });

    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Updates a notfication URL of an existing chaincode event
   * @function
   * @name update
   * @param  {object} options Parameters
   * @property {string} options.chaincodeName Name of the chaincode where notification is to be added
   * @property {string} options.channelName Name of the channel where chaincode is instantiated
   * @property {string} options.chaincodeEventName Name of the chaincode event on which notification is to be triggered
   * @property {string} options.notificationURL URL where the notification is to be sent
   * @return {string} Response from server
   * @memberof Notification
   * @method
   * @instance
   */
  async update({ chaincodeName, channelName, chaincodeEventName, notificationURL }) {
    if (!chaincodeName) {
      throw new Error('Notification update error : chaincodeName is required');
    }

    if (!channelName) {
      throw new Error('Notification update error : chaincodeName is required');
    }

    if (!chaincodeEventName) {
      throw new Error('Notification update error : chaincodeEventName is required');
    }

    if (!notificationURL) {
      throw new Error('Notification update error : notificationURL is required');
    }

    const res = await node.__constructNodeRequest('/notifications/update', RequestTypes.POST, {
      chaincodeName,
      channelName,
      chaincodeEventName,
      notificationURL,
    });

    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Removes a notification URL for a chaincode event
   * @function
   * @name update
   * @param  {object} options Parameters
   * @property {string} options.chaincodeName Name of the chaincode where notification is to be added
   * @property {string} options.channelName Name of the channel where chaincode is instantiated
   * @property {string} options.chaincodeEventName Name of the chaincode event on which notification is to be triggered
   * @return {string} Response from server
   * @memberof Notification
   * @method
   * @instance
   */
  async remove({ chaincodeName, channelName, chaincodeEventName }) {
    if (!chaincodeName) {
      throw new Error('Notification update error : chaincodeName is required');
    }

    if (!channelName) {
      throw new Error('Notification update error : chaincodeName is required');
    }

    if (!chaincodeEventName) {
      throw new Error('Notification update error : chaincodeEventName is required');
    }

    const res = await node.__constructNodeRequest('/notifications/remove', RequestTypes.POST, {
      chaincodeName,
      channelName,
      chaincodeEventName,
    });

    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Lists all notification events and URLs
   * @function
   * @name list
   * @return {Array<NotificationEvent>} List of notifications
   * @memberof Notification
   * @method
   * @instance
   */
  async list() {
    const res = await node.__constructNodeRequest('/notifications/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
});
