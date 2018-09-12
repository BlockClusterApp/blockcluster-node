const request = require('request');

const helpers = {
  getRequestType: apiName => {
    const postTypes = [
      'assets/createAssetType',
      'assets/issueSoloAsset',
      'assets/getSoloAssetInfo'
    ];
    const getTypes = [];

    return postTypes.includes(apiName)
      ? 'POST'
      : getTypes.includes(apiName)
        ? 'GET'
        : null;
  },
  sendRequest: (config, data) => {
    const options = {
      uri: `https://${config.locationDomain}/api/node/${config.instanceId}/${
        config.apiName
      }`,
      method: helpers.getRequestType(config.apiName),
      json: data,
      headers: {
        Authorization:
          'Basic' +
          Buffer.from(`${config.instanceId}:${config.password}`).toString(
            'base64'
          )
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          if (body.error) reject(error);
          else resolve(body);
        } else reject(error);
      });
    });
  }
};

module.exports = helpers;
