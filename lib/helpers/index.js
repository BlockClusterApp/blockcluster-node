const request = require('request');
const rp = require('request-promise');
const EthereumTx = require('ethereumjs-tx');
const APIs = require('./APIs.json');

function getHost() {
  return `https://${process.env.NODE_ENV === 'test' ? 'test' : 'app'}.blockcluster.io`;
}

const helpers = {
  getHost,
  getRequestType: apiName => APIs[apiName].requestType,
  getOperationType: apiName => APIs[apiName].operationType,
  getCategory: apiName => APIs[apiName].category,
  sendPlatformRequest: async ({ path, method, body, apiKey }) => {
    const options = {
      uri: `${getHost()}${path}`,
      method: method.toUpperCase(),
      json: true,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body) {
      options.body = body;
    }

    try {
      const res = await rp(options);
      return res;
    } catch (err) {
      return Promise.reject(err);
    }
  },
  sendRequest: (config, data) => {
    const options = {
      uri: `https://${config.locationDomain}/api/node/${config.instanceId}/${config.apiName}`,
      method: helpers.getRequestType(config.apiName),
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.instanceId}:${config.password}`).toString('base64')}`,
      },
    };

    if (helpers.getRequestType(config.apiName) === 'POST') {
      options.json = data;
    } else if (helpers.getRequestType(config.apiName) === 'GET') {
      options.qs = data;
    }

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          if (body.error) reject(error);
          else resolve(body);
        } else reject(error);
      });
    });
  },
  getTxnReceipt: (txnHash, web3) =>
    new Promise((resolve, reject) => {
      web3.eth.getTransactionReceipt(txnHash, (error, receipt) => {
        if (!error && receipt) {
          resolve();
        } else {
          reject();
        }
      });
    }),
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
  },
  signAndSendRawTxns: (config, rawTxns, key) => {
    if (typeof rawTxns === 'object') rawTxns = [rawTxns];
    const serializedTxns = [];

    rawTxns.forEach(txn => {
      const tx = new EthereumTx(txn);
      const privateKey = Buffer.from(key, 'hex');
      tx.sign(privateKey);
      serializedTxns.push(`0x${tx.serialize().toString('hex')}`);
    });

    const options = {
      uri: `https://${config.locationDomain}/api/node/${config.instanceId}/transactions/sendRaw`,
      method: 'POST',
      json: {
        txns: serializedTxns,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.instanceId}:${config.password}`).toString('base64')}`,
      },
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
};

module.exports = helpers;
