const helpers = require('../../helpers');

class Paymeter {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
  }

  async createWallet({ coinType, walletName, network, password, contractAddress, tokenSymbol }) {
    if (!(coinType && walletName && network && password)) {
      return Promise.reject(new Error('CoinType, walletName, network and password are required fields'));
    }

    const path = '/api/paymeter/wallets';

    const body = {
      coinType,
      walletName,
      network,
      options: {
        password
      }
    };

    if (coinType.toLowerCase() === 'erc20') {
      body.options.contractAddress = contractAddress;
      body.options.tokenSymbol = tokenSymbol;
    }

    try {
      const resp = await helpers.sendPlatformRequest({
        path,
        method: 'POST',
        body,
        apiKey: this.apiKey
      });
      return resp.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getWallets({ walletId }) {
    let path = '/api/paymeter/wallets';

    if (walletId) {
      path = `${path}/${walletId}`;
    }

    try {
      const resp = await helpers.sendPlatformRequest({
        path,
        method: 'GET',
        apiKey: this.apiKey
      });
      return resp.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getWithdrawals({ walletId }) {
    const path = `/api/paymeter/wallets/${walletId}/withdrawals`;

    if (!walletId) {
      return Promise.reject(new Error('walletId is a required option'));
    }

    try {
      const resp = await helpers.sendPlatformRequest({
        path,
        method: 'GET',
        apiKey: this.apiKey
      });
      return resp.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async sendTokens({ walletId, fromWalletId, toAddress, amount, password, feeWallet, feeWalletPassword }) {
    if (!walletId) {
      return Promise.reject(new Error('walletId is a required option'));
    }

    if (!(walletId && fromWalletId && toAddress && amount && password)) {
      return Promise.reject(new Error('walletId, fromWalletId,  toAddress,  amount, password are required fields'));
    }

    const path = `/api/paymeter/wallets/:${walletId}/send`;

    const body = {
      fromWalletId,
      toAddress,
      amount,
      options: {
        password
      }
    };

    if (feeWallet.toLowerCase() === 'erc20') {
      body.options.feeWallet = feeWallet;
      body.options.feeWalletPassword = feeWalletPassword;
    }

    try {
      const resp = await helpers.sendPlatformRequest({
        path,
        method: 'POST',
        body,
        apiKey: this.apiKey
      });
      return resp.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Paymeter;
