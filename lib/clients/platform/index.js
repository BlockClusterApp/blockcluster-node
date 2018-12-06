const helpers = require('../../helpers');

class Platform {
  constructor({ apiKey }) {
    this.apiKey = apiKey;

    if (!this.apiKey) {
      throw new Error('API Key required while initializing Platform module');
    }
  }

  async fetchNetworkTypes() {
    const path = '/api/platform/networks/types';

    try {
      const networks = await helpers.sendPlatformRequest({ path, method: 'GET', apiKey: this.apiKey });
      return networks;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async fetchLocations() {
    const path = '/api/platform/networks/locations';

    try {
      const locations = await helpers.sendPlatformRequest({ path, method: 'GET', apiKey: this.apiKey });
      return locations;
    } catch (err) {
      return Promise.reject(err);
    }
  }

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

  async deleteNetwork({ networkId }) {
    const path = `/api/platform/networks/${networkId}`;

    try {
      const res = await helpers.sendPlatformRequest({ path, method: 'DELETE', apiKey: this.apiKey });
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  }

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

  async inviteViaEmail({ inviteToEmail, networkId, networkType }) {
    const path = '/api/platform/networks/invite';

    if (!(inviteToEmail && inviteToEmail.split('@').length === 2)) {
      return Promise.reject(new Error('Invalid email id to invite'));
    }

    if (!networkId) {
      return Promise.reject(new Error('Network id is required'));
    }

    if (['authority', 'peer'].includes(networkType)) {
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
