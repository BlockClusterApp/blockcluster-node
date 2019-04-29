const helpers = require('../../../helpers');
const PrivatehiveNode = require('../../privatehive');
/**
 * @namespace Privatehive
 * @since 3.0.1
 */
module.exports = node => ({
  /**
   * Creates a privatehive node
   * @function
   * @name create
   * @param  {object} options Options
   * @param {string} [options.peerId] Peer Id to which the orderer joins. Required only incase of orderer type
   * @param {string} options.locationCode Location code where the network should be deployed
   * @param {peer|orderer} options.type Type of network. Either peer or orderer
   * @param {string} [options.voucherCode] Voucher code to be applied
   * @param {string} options.name Name of the network. Required
   * @param {string} options.orgName Organization to which the node belongs to
   * @param {solo|kafka} [options.ordererType] Type of orderer to be created. Solo or Kafka. Required only if type is orderer
   * @param {stirng} options.networkConfigId ID of network configuration
   * @param {number} [options.diskSpace] Disk space required for this node. Applicable only if network configuration has isDiskChangeable = true
   * @returns {string} Instance ID of the created network
   * @example <caption>Create a privatehive network of type peer</caption>
   *   const peerId = await platform.privatehive.create({
   *   locationCode: 'us-west-2',
   *   type: 'peer',
   *   orgName: 'blockcluster',
   *   name: `Peer 1`,
   *   networkConfigId: 'abcgdghfjgmgh',
   * });
   * console.log(peerId);
   * // Prints the instance id of the created node
   * @memberof Privatehive
   * @instance
   */
  create: async ({ peerId, locationCode, type, voucherCode, name, orgName, ordererType, networkConfigId, diskSpace }) => {
    if (type === 'orderer' && !peerId) {
      return Promise.reject(new Error('PeerID is required to create orderer'));
    }

    if (!name) {
      return Promise.reject(new Error('Name is required'));
    }

    if (!orgName) {
      return Promise.reject(new Error('Organization Name is required'));
    }

    if (type === 'orderer' && !ordererType) {
      console.warn('OrdererType not specified. Defaulting to solo');
      ordererType = 'solo';
    }

    if (!networkConfigId) {
      return Promise.reject(new Error('Network configuration id is required'));
    }

    if (!locationCode) {
      return Promise.reject(new Error('Location code is required'));
    }

    const body = {
      locationCode,
      name,
      orgName,
      networkConfigId,
      diskSpace,
      voucherCode,
      type,
    };

    if (type === 'orderer') {
      body.ordererType = ordererType;
      body.peerId = peerId;
    }

    const path = '/api/platform/privatehive';

    try {
      const res = await helpers.sendPlatformRequest({ domain: node.domain, path, method: 'POST', body, apiKey: node.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Lists details of privatehive networks
   * @function
   * @name list
   * @param  {string} [instanceId] If provided then fetches details of only this instance
   * @param  {object} options Additional filters
   * @param {bool} [options.showDeleted] If true then shows all the deleted networks as well
   * @param {peer|orderer} [options.nodeType] Queries only a particular type of node
   * @param {string} [options.locationCode] Queries networks only in this location
   * @param {date} [options.createdAfter] Queries networks created after this date
   * @param {date} [options.createdBefore] Queries networks created before this date
   * @returns {Array<Node>} Array of networks matching the filters
   * @example <caption>Lists all the active privatehive networks</caption>
   * const networks = await platform.privatehive.list({ showDeleted: false });
   * console.log(networks);
   * // Prints List of networks
   * @example <caption>List details of single network</caption>
   * const networks = await platform.privatehive.list('instanceId1123);
   * console.log(networks);
   * // Prints List containing one network of the given instanceId
   * @memberof Privatehive
   * @instance
   */
  list: async (instanceId, options = {}) => {
    let path = '/api/platform/privatehive';
    if (instanceId && typeof instanceId === 'string') {
      path = `${path}/${instanceId}`;
    } else {
      options = instanceId;
    }

    const { nodeType, locationCode, createdAfter, createdBefore } = options;
    let { showDeleted } = options;

    showDeleted = Boolean(showDeleted);
    path = `${path}?showDeleted=${showDeleted}`;
    if (nodeType) {
      path = `${path}&nodeType=${nodeType}`;
    }

    if (locationCode) {
      path = `${path}&locationCode=${locationCode}`;
    }

    if (createdAfter) {
      path = `${path}&createdAfter=${createdAfter}`;
    }

    if (createdBefore) {
      path = `${path}&createdBefore=${createdBefore}`;
    }

    try {
      const res = await helpers.sendPlatformRequest({ domain: node.domain, path, method: 'GET', apiKey: node.apiKey });
      return res.data;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Delets a privatehive node
   * @function
   * @name delete
   * @param  {string} networkId Instance ID of the network to be deleted
   * @returns {string} InstanceID of deleted network
   * @example <caption>Deletes a privatehive node</caption>
   * const instanceID = await platform.privatehive.delete('instanceId1234');
   * console.log(instanceID);
   * // Prints the instanceid of deleted network
   * @memberof Privatehive
   * @instance
   */
  delete: async networkId => {
    const path = `/api/platform/privatehive/${networkId}`;

    try {
      const res = await helpers.sendPlatformRequest({ domain: node.domain, path, method: 'DELETE', apiKey: node.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  /**
   * Invites a user to a HLF channel. The invited user can select the peer which will join the channel
   * @function
   * @name inviteUserToChannel
   * @param  {object} params Options
   * @param {string} params.email Email of the user to be invited
   * @param {string} params.peerId Instance ID of the peer to be invited
   * @param {string} params.channelName Channel to which the user should be invited to
   * @param {string} params.ordererDomain Domain of the orderer
   * @param {string} params.ordererConnectionDetails Connection details of the orderer like "grpc://1.2.3.4:1234"
   * @returns {string} Invite ID
   * @example <caption>Invites a user to a channel</caption>
   * const inviteID = await platform.privatehive.inviteUserToChannel({
   *    email: 'jibin.mathews@blockcluster.io',
   *    peerId: 'inviteInstancePeerID',
   *    channelName: 'mychannel',
   *    ordererDomain: `orderer.${orderer.organization.toLowerCase()}.com`,
   *    ordererConnectionDetails: `grpc://${orderer.ordererURL}`,
   * });
   * console.log(inviteID);
   * // Prints the inviteID for others to accept
   * @memberof Privatehive
   * @instance
   */
  inviteUserToChannel: async ({ email, peerId, channelName, ordererDomain, ordererConnectionDetails }) => {
    const path = '/api/platform/privatehive/invite';
    const body = {
      email,
      networkId: peerId,
      channelName,
      ordererDomain,
      ordererConnectionDetails,
    };

    try {
      const res = await helpers.sendPlatformRequest({ domain: node.domain, path, method: 'POST', body, apiKey: node.apiKey });
      return res.data.inviteId;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Accepts an invite to join a channel
   * @function
   * @name acceptChannelInvitation
   * @param  {string} inviteId InviteID to be accepted
   * @param  {string} peerId InstanceID of the peer to join the channel
   * @returns {string} InstanceID of the joined peer
   * @example <caption>Accepts a channel invitation</caption>
   * const instanceID = await platform.privatehive.acceptChannelInvitation('inviteid123', 'peerid123');
   * console.log(instanceID);
   * // Prints the instanceID of the joined peer
   * @memberof Privatehive
   * @instance
   */
  acceptChannelInvitation: async (inviteId, peerId) => {
    const path = `/api/platform/privatehive/invite/accept/${inviteId}`;
    const body = {
      peerId,
    };
    try {
      const res = await helpers.sendPlatformRequest({ domain: node.domain, path, method: 'POST', body, apiKey: node.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  /**
   * Lists all pending privatehive channel invites
   * @function
   * @name listChannelInvites
   * @returns {Array<Invite>} List of invites
   * @example <caption>Lists all the pending channel invitation</caption>
   * const invites = await platform.privatehive.listChannelInvites();
   * console.log(invites);
   * // Prints the pending invitations
   * @memberof Privatehive
   * @instance
   */
  listChannelInvites: async () => {
    const path = '/api/platform/privatehive/invite';
    try {
      const res = await helpers.sendPlatformRequest({ domain: node.domain, path, method: 'GET', apiKey: node.apiKey });
      return res.data;
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Returns privatehive node object to operate on it
   * @function
   * @name getNode
   * @param  {object} nodeInfo Node information details. Can be fetched from listPrivatehiveNetworks(instanceId)
   * @returns {PrivatehiveNode} Privatehive node instance
   * @memberof Privatehive
   * @instance
   */
  getNode: async nodeInfo => {
    const _node = { ...nodeInfo };
    if (nodeInfo.ordererType) {
      nodeInfo.type = 'orderer';
    }

    return new PrivatehiveNode(_node);
  },
});
