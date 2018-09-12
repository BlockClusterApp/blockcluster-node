const request = require('request');
const APIs = require('./APIs.json');

const helpers = {
  getRequestType: apiName => {
    return APIs[apiName].requestType;
  },
  getOperationType: apiName => {
    return APIs[apiName].operationType;
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
          'Basic ' +
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
  },
  getTxnReceipt: (txnHash, web3) => {
    return new Promise((resolve, reject) => {
      web3.eth.getTransactionReceipt(txnHash, (error, receipt) => {
        if (!error && receipt) {
          resolve();
        } else {
          reject();
        }
      });
    });
  },
  txnsMined: async (txns, web3) => {
    if (typeof txns === 'string') txns = [txns];
    const allReceipts = async () => {
      const receipts = [];

      txns.forEach(txn => {
        receipts.push(helpers.getTxnReceipt(txn, web3));
      });

      try {
        await Promise.all(receipts);
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await allReceipts();
      }
    };

    await allReceipts();
    return Promise.resolve();
  }
};

module.exports = helpers;
