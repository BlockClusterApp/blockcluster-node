const helpers = require('../../helpers');
const PrivatehiveNode = require('../privatehive');

/**
 * @classdesc Handles all functions related to the blockcluster platform operation
 * @param  {object} options Options
 * @property {string} apiKey API Key for authentication
 * @property {string} [domain] Domain where the platform is hosted
 * @class Platform
 */
class Platform {
  constructor({ apiKey, domain }) {
    this.apiKey = apiKey;
    this.domain = domain || helpers.getHost();
    if (!this.apiKey) {
      throw new Error('API Key required while initializing Platform module');
    }
  }

  /**
   * Fetches all the applicable network types. You need to pass the network type id in any create or invite request
   * @param {dynamo|privatehive} [service] Service for which the configurations are to be fetched
   * @return {Promise<array>} List of network types
   * @memberof Platform
   * @instance
   */
  async fetchNetworkTypes(service = 'dynamo') {
    const path = `/api/platform/network-types?service=${service}`;

    try {
      const networks = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'GET', apiKey: this.apiKey });
      return networks;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Fetches all the applicable locations. You need to pass the location code in any create or invite request
   * @param {dynamo|privatehive} [service] Service for which the locations are to be fetched
   * @return {Promise<array>} List of locations
   * @memberof Platform
   * @instance
   */
  async fetchLocations(service = 'dynamo') {
    const path = `/api/platform/locations?service=${service}`;

    try {
      const locations = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'GET', apiKey: this.apiKey });
      return locations;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Creates a blockcluster node
   * @param  {object} options Network options
   * @param  {string} options.networkName Name of the network to be created
   * @param {string} options.networkConfigId Id of the network type from the ` fetchNetworkType() ` function
   * @param {string} options.locationCode Location code from the list of available location from ` fetchLocations() ` function
   * @return {Promise<string|err>} Id of the network which was created
   * @memberof Platform
   * @instance
   */
  async createNetwork({ networkName, networkConfigId, locationCode }) {
    const path = '/api/platform/networks';
    const body = {
      networkName,
      networkConfigId,
      locationCode,
    };
    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      if (res && res.data) {
        return res.data;
      }
    } catch (err) {
      return Promise.reject(err);
    }

    return null;
  }

  /**
   * Deletes a network from the blockcluster platform
   * @param  {string} networkId Id of the network to be deleted
   * @return {Promise<any>} Response of the delete operation
   * @memberof Platform
   * @instance
   */
  async deleteNetwork(networkId) {
    const path = `/api/platform/networks/${networkId}`;

    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'DELETE', apiKey: this.apiKey });
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Creates a network which will be joined to an existing network having all the details
   * @param  {object} options Network options
   * @param {string} options.networkName Name of the network to be created
   * @param {string<authority|peer>} options.nodeType Type of network
   * @param {string} options.genesisFileContent Content of genesis block
   * @param {Array<string>} options.totalENodes List of enode urls to be joined
   * @param {string} options.impulseURL URL of impulse
   * @param {string} options.assetsContractAddress Asset smart contract address
   * @param {string} options.atomicSwapContractAddress Atomic Swap smart contract address
   * @param {string} options.streamsContractAddress Steams smart contract address
   * @param {string} options.impulseContractAddress Impulse smart contract address
   * @param {string} options.locationCode  Location code from the list of available location from ` fetchLocations() ` function
   * @param {string} options.networkConfigId Id of the network type from the ` fetchNetworkType() ` function
   * @return {Promise<any>} Instance id or error message
   * @memberof Platform
   * @instance
   */
  async joinNetwork({
    networkName,
    nodeType,
    genesisFileContent,
    totalENodes,
    impulseURL,
    assetsContractAddress,
    atomicSwapContractAddress,
    streamsContractAddress,
    impulseContractAddress,
    locationCode,
    networkConfigId,
  }) {
    const path = '/api/platform/networks/join';
    const body = {
      networkName,
      nodeType: nodeType.toLowerCase(),
      genesisFileContent,
      totalENodes,
      impulseURL,
      assetsContractAddress,
      atomicSwapContractAddress,
      streamsContractAddress,
      impulseContractAddress,
      locationCode,
      networkConfigId,
    };

    if (!Array.isArray(totalENodes)) {
      return Promise.reject(new Error('TotalENodes should be an array of ENode URLs'));
    }

    if (!['authority', 'peer'].includes(body.nodeType)) {
      return Promise.reject(new Error('Node type should either be authority or peer'));
    }

    Object.keys(body).forEach(key => {
      if (!body[key]) {
        throw new Error(`Missing property ${key}`);
      }
    });

    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Invites another use to join a node on the blockcluster platform
   * @param  {object} options Invite options
   * @param {string} options.inviteToEmail Email id of the user to be invited. The email id should be a user of blockcluster to be able to join the network.
   * If the user is not on the blockcluster platform then an account in pending state will be created with this email id
   * @param {string} options.networkId Id of the network to which the new node should join
   * @param {string<peer|authority>} options.networkType Type of network the new network will be
   * @return {Promise<string>} Invite id of the invite. Use this invite id to accept
   * @memberof Platform
   * @instance
   */
  async inviteViaEmail({ inviteToEmail, networkId, networkType }) {
    const path = '/api/platform/networks/invite';

    if (!(inviteToEmail && inviteToEmail.split('@').length === 2)) {
      return Promise.reject(new Error('Invalid email id to invite'));
    }

    if (!networkId) {
      return Promise.reject(new Error('Network id is required'));
    }

    if (!['authority', 'peer'].includes(networkType)) {
      return Promise.reject(new Error('Network type type should either be authority or peer'));
    }

    const body = {
      inviteToEmail,
      networkId,
      networkType,
    };

    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      return res.inviteId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Accepts an invite sent using the ` inviteViaEmail() ` function
   * @param  {object} options Invite options
   * @param {string} options.inviteId Id of the invite to accept
   * @param {string} options.locationCode Location code from the list of available location from ` fetchLocations() ` function
   * @param {string} options.networkConfigId Id of the network type from the ` fetchNetworkType() ` function
   * @return {Promise<any>} Instance id or error
   * @memberof Platform
   * @instance
   */
  async acceptInvite({ inviteId, locationCode, networkConfigId }) {
    const path = '/api/platform/networks/invite/accept';

    const body = {
      inviteId,
      locationCode,
      networkConfigId,
    };

    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Creates a privatehive node
   * @param  {object} options Options
   * @property {string} [options.peerId] Peer Id to which the orderer joins. Required only incase of orderer type
   * @property {string} options.locationCode Location code where the network should be deployed
   * @property {peer|orderer} options.type Type of network. Either peer or orderer
   * @property {string} [options.voucherCode] Voucher code to be applied
   * @property {string} options.name Name of the network. Required
   * @property {string} options.orgName Organization to which the node belongs to
   * @property {solo|kafka} [options.ordererType] Type of orderer to be created. Solo or Kafka. Required only if type is orderer
   * @property {stirng} options.networkConfigId ID of network configuration
   * @property {number} [options.diskSpace] Disk space required for this node. Applicable only if network configuration has isDiskChangeable = true
   * @return {string} Instance ID of the created network
   * @memberof Platform
   * @instance
   */
  async createPrivatehiveNetwork({ peerId, locationCode, type, voucherCode, name, orgName, ordererType, networkConfigId, diskSpace }) {
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
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Lists details of privatehive networks
   * @param  {string} [instanceId] If provided then fetches details of only this instance
   * @param  {object} options Additional filters
   * @property {bool} [options.showDeleted] If true then shows all the deleted networks as well
   * @property {peer|orderer} [options.nodeType] Queries only a particular type of node
   * @property {string} [options.locationCode] Queries networks only in this location
   * @property {date} [options.createdAfter] Queries networks created after this date
   * @property {date} [options.createdBefore] Queries networks created before this date
   * @return {Array<Node>} Array of networks matching the filters
   * @memberof Platform
   * @instance
   */
  async listPrivatehiveNetworks(instanceId, options = {}) {
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
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'GET', apiKey: this.apiKey });
      return res.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Delets a privatehive node
   * @param  {string} networkId Instance ID of the network to be deleted
   * @return {string} InstanceID of deleted network
   * @memberof Platform
   * @instance
   */
  async deletePrivatehiveNetwork(networkId) {
    const path = `/api/platform/privatehive/${networkId}`;

    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'DELETE', apiKey: this.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Invites a user to a HLF channel. The invited user can select the peer which will join the channel
   * @param  {object} params Options
   * @property {string} params.email Email of the user to be invited
   * @property {string} params.peerId Instance ID of the peer to be invited
   * @property {string} params.channelName Channel to which the user should be invited to
   * @property {string} params.ordererDomain Domain of the orderer
   * @property {string} params.ordererConnectionDetails Connection details of the orderer like "grpc://1.2.3.4:1234"
   * @return {string} Invite ID
   * @memberof Platform
   * @instance
   */
  async inviteUserToChannel({ email, peerId, channelName, ordererDomain, ordererConnectionDetails }) {
    const path = '/api/platform/privatehive/invite';
    const body = {
      email,
      networkId: peerId,
      channelName,
      ordererDomain,
      ordererConnectionDetails,
    };

    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      return res.data.inviteId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Accepts an invite to join a channel
   * @param  {string} inviteId InviteID to be accepted
   * @param  {string} peerId InstanceID of the peer to join the channel
   * @return {string} InstanceID of the joined peer
   * @memberof Platform
   * @instance
   */
  async acceptPrivatehiveChannelInvite(inviteId, peerId) {
    const path = `/api/platform/privatehive/invite/accept/${inviteId}`;
    const body = {
      peerId,
    };
    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'POST', body, apiKey: this.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Lists all pending privatehive channel invites
   * @return {Array<Invite>} List of invites
   * @memberof Platform
   * @instance
   */
  async listPrivatehiveChannelInvites() {
    const path = '/api/platform/privatehive/invite';
    try {
      const res = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'GET', apiKey: this.apiKey });
      return res.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   *  Returns privatehive node object to operate on it
   * @param  {object} nodeInfo Node information details. Can be fetched from listPrivatehiveNetworks(instanceId)
   * @return {PrivatehiveNode} Privatehive node instance
   * @memberof Platform
   * @instance
   */
  getPrivatehiveNode(nodeInfo) {
    const node = { ...nodeInfo };
    if (nodeInfo.ordererType) {
      nodeInfo.type = 'orderer';
    }

    return new PrivatehiveNode(node);
  }
}

module.exports = Platform;
