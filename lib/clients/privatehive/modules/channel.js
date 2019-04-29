const { RequestTypes } = require('../../../helpers/requests');

/**
 * @typedef ChannelType
 * @property {string} name Name of the channel
 * @property {string} ordererDomain Domain of the orderer
 * @property {string} connectionDetails Orderer connection details
 */

/**
 *
 * @namespace Channel
 * @since 3.0.1
 */
module.exports = node => ({
  /**
   * Creates a channel in the privatehive node
   * @function
   * @name create
   * @param  {string} name Name of the channel to be created
   * @param  {string} [ordererURL] GRPC url (without the protocol) of the orderer
   * @param  {string} [ordererDomain] Orderer's organization domain
   * @returns {Promise<string>} Response from the node
   * @memberof Channel
   * @method
   * @instance
   */
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
   * @function
   * @name list
   * @returns {Promise<Array<ChannelType>>} List of channels
   * @memberof Channel
   * @method
   * @instance
   */
  async list() {
    const res = await node.__constructNodeRequest('/channels/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
});
