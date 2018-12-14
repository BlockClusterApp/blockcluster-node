const helpers = require('../../helpers');

/**
 * Handles all function related to paymeter
 * @class Paymeter
 */
class Paymeter {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
  }

  /**
   * Creates a new wallet in the blockcluster account
   * @param {object} options Wallet configuration
   * @param {string} options.coinType Coin type Eg: ETH, ERC20 etc
   * @param {string} options.walletName Name of the wallet
   * @param {string} options.network Network on which the wallet will function Eg: testnet or mainnet
   * @param {string} options.password Password for the wallet
   * @param {string} [options.contractAddress] Contract address for ERC20 type token
   * @param {string} [options.tokenSymbol] Symbol for ERC20 token
   * @example <caption>Creates a wallet</caption>
   * const walletId = await paymeter.createWallet({coinType: 'ETH', walletName: 'My ETH Wallet', network: 'mainnet', password: '1234567890' });
   * console.log(walletId);
   * // Prints the walletId <random string>
   * @return {Promise<string>} Wallet id
   * @memberof Paymeter
   */
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
      console.log('Create wallet response ', resp);
      return resp.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Fetches all the wallets or a single wallet details
   * @param  {string} [walletId] Id of the wallet for the details needs to be fetched. If undefined then fetches all wallets
   * @example <caption>Fetches all wallets</caption>
   * const wallets = await paymeter.getWallets();
   * console.log(wallets);
   * // Prints [{_id: '...', ...}, ...]
   * @example <caption>Fetches details of single wallet</caption>
   * const wallet = await paymeter.getWallets('abcdefghi');
   * console.log(wallet);
   * // Prints {_id: 'abcdefghi', ...}
   * @return {Promise<array|object>}
   * @memberof Paymeter
   */
  async getWallets(walletId) {
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

  /**
   * Fetches all the withdrawals happend for a wallet
   * @param  {string} walletId Id of the wallet for which the transactions need to be fetched
   * @example <caption>Fetches all withdrawals for a wallet</caption>
   * const withdrawals = await paymeter.getWithdrawals('abcdefghi');
   * console.log(withdrawals);
   * // Prints [{...withdrawal1}, {...}, ...]
   * @return {Promise<array>}
   * @memberof Paymeter
   */
  async getWithdrawals(walletId) {
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

  /**
   * Transfers token from a wallet to specified address
   * @param {object} options Wallet configuration
   * @param {string} options.fromWalletId Id of the wallet from which to transfer tokens
   * @param {string} options.toAddress Address to which tokens are to be transferred
   * @param {string} options.amount Amount of tokens to be transferred. Maximum of 5 decimal places
   * @param {string} options.password Password for the wallet from which tokens are to be transferred
   * @param {string} [options.feeWallet] Only for ERC20 tokens, wallet Id from where the transaction fee is to be deducted
   * @param {string} [options.feeWalletPassword] Only for ERC20 tokens, password for the feeWallet specified
   * @return {Promise<string>} Transaction id
   * @memberof Paymeter
   */
  async send({ fromWalletId, toAddress, amount, password, feeWallet, feeWalletPassword }) {
    if (!fromWalletId) {
      return Promise.reject(new Error('walletId is a required option'));
    }

    if (!(fromWalletId && toAddress && amount && password)) {
      return Promise.reject(new Error('fromWalletId,  toAddress,  amount, password are required fields'));
    }

    const path = `/api/paymeter/wallets/:${fromWalletId}/send`;

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
