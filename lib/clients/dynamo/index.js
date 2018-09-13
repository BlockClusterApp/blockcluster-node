const Web3 = require('web3');
const helpers = require('../../helpers');

class Dynamo {
  constructor(config) {
    this.config = { ...config };
  }

  async callAPI(apiName, data, rawConfig) {
    try {
      data = data || {};
      if (rawConfig) data.raw = true;

      const requestConfig = {
        locationDomain: this.config.locationDomain,
        instanceId: this.config.instanceId,
        apiName,
        password: this.config.password || ''
      };

      const response = await helpers.sendRequest(requestConfig, data);

      if (
        helpers.getOperationType(apiName) === 'write' &&
        helpers.getCategory(apiName) === 'blockchain'
      ) {
        if (rawConfig) {
          response.txnHash = (await helpers.signAndSendRawTxns(
            requestConfig,
            response.rawTx,
            rawConfig.privateKey
          )).txnHash;
          delete response.rawTx;
          await helpers.txnsMined(response.txnHash, this.getWeb3());
        } else {
          await helpers.txnsMined(response.txnHash, this.getWeb3());
        }
      }

      return response;
    } catch (error) {
      return Promise.reject(error);
    }
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
