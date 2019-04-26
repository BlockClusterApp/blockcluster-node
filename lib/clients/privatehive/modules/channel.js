const { RequestTypes } = require('../../../helpers/requests');

module.exports = node => ({
  async create(name, ordererURL = '', ordererDomain = '') {
    if (!name) {
      throw new Error('Channel create error : name is required');
    }

    if (!ordererURL && !(node.orderer && node.orderer.ordererURL)) {
      throw new Error('Channel create error : Orderer URL is missing. Specifiy orderer url or set orderer to this node');
    }

    if (!ordererDomain && !(node.orderer && node.orderer.organization)) {
      throw new Error('Channel create error : Orderer organization name is missing. Specifiy orderer url or set orderer to this node');
    }

    const channelReq = node.__constructNodeRequest('/channel/create', RequestTypes.POST, {
      name,
      ordererDomain: ordererDomain || `orderer.${node.orderer.organization.toLowerCase()}.com`,
      ordererURL: ordererURL || node.orderer.ordererURL,
    });

    const res = await channelReq;
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Returns list of all the channels
   * @return {Promise<Array<string>>} List of channels
   * @memberof PrivatehiveNode.channel
   */
  async list() {
    const res = await node.__constructNodeRequest('/channels/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
});
