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
      return err;
    }
  }

  async fetchLocations() {
    const path = '/api/platform/networks/locations';

    try {
      const locations = await helpers.sendPlatformRequest({ path, method: 'GET', apiKey: this.apiKey });
      return locations;
    } catch (err) {
      return err;
    }
  }
}

module.exports = Platform;
