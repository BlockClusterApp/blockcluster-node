const helpers = require('../../helpers');

/**
 * Handles all functions related to the blockcluster platform operation
 * @class Platform
 */
class Platform {
  constructor({ apiKey }) {
    this.apiKey = apiKey;

    if (!this.apiKey) {
      throw new Error('API Key required while initializing Platform module');
    }
  }

  /**
   * Fetches all the applicable network types. You need to pass the network type id in any create or invite request
   * @return {Promise<array>} List of network types
   * @memberof Platform
   */
  async fetchNetworkTypes() {
    const path = '/api/platform/networks/types';

    try {
      const networks = await helpers.sendPlatformRequest({ path, method: 'GET', apiKey: this.apiKey });
      return networks;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Fetches all the applicable locations. You need to pass the location code in any create or invite request
   * @return {Promise<array>} List of locations
   * @memberof Platform
   */
  async fetchLocations() {
    const path = '/api/platform/networks/locations';

    try {
      const locations = await helpers.sendPlatformRequest({ path, method: 'GET', apiKey: this.apiKey });
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
   */
  async createNetwork({ networkName, networkConfigId, locationCode }) {
    const path = '/api/platform/networks';
    const body = {
      networkName,
      networkConfigId,
      locationCode,
    };
    try {
      const res = await helpers.sendPlatformRequest({ path, method: 'POST', body, apiKey: this.apiKey });
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
   */
  async deleteNetwork(networkId) {
    const path = `/api/platform/networks/${networkId}`;

    try {
      const res = await helpers.sendPlatformRequest({ path, method: 'DELETE', apiKey: this.apiKey });
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
      const res = await helpers.sendPlatformRequest({ path, method: 'POST', body, apiKey: this.apiKey });
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
      const res = await helpers.sendPlatformRequest({ path, method: 'POST', body, apiKey: this.apiKey });
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
   */
  async acceptInvite({ inviteId, locationCode, networkConfigId }) {
    const path = '/api/platform/networks/invite/accept';

    const body = {
      inviteId,
      locationCode,
      networkConfigId,
    };

    try {
      const res = await helpers.sendPlatformRequest({ path, method: 'POST', body, apiKey: this.apiKey });
      return res.data.instanceId;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Platform;
