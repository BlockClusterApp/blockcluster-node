const { RequestTypes } = require('../../../helpers/requests');

module.exports = node => ({
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
  async list() {
    const res = await node.__constructNodeRequest('/notifications/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
});
