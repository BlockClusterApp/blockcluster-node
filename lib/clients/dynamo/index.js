const Web3 = require('web3');
const helpers = require('../../helpers');

class Dynamo {
  constructor(config) {
    this.config = { ...config };
  }

  callAPI(apiName, data, rawConfig) {
    return new Promise(resolve => {
      if (rawConfig) data.raw = true;

      const requestConfig = {
        locationDomain: this.config.locationDomain,
        instanceId: this.config.instanceId,
        apiName,
        password: this.config.password || ''
      };

      resolve(helpers.sendRequest(requestConfig, data));
    });
  }

  getWeb3() {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://${this.config.locationDomain}/api/node/${
          this.config.instanceId
        }/jsonrpc`,
        0,
        this.config.instanceId,
        this.config.password
      )
    );

    return web3;
  }
}

module.exports = Dynamo;
