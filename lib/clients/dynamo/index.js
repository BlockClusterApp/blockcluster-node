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
        apiName
      };

      resolve(helpers.sendRequest(requestConfig, data));
    });
  }
}

module.exports = Dynamo;
