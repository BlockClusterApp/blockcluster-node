const helpers = require('../../helpers');

class Dynamo {
  constructor(config) {
    this.config = { ...config };
  }

  callAPI(apiName, data, rawConfig) {
    return new Promise((resolve, reject) => {
      if (rawConfig) data.raw = true;

      const requestConfig = {
        locationDomain: this.config.locationDomain,
        instanceId: this.config.instanceId,
        apiName
      };

      try {
        const result = helpers.sendRequest(requestConfig, data);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Dynamo;
