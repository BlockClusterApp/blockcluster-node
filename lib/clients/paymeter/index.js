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
        password,
      },
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
        apiKey: this.apiKey,
      });
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
   * @return {Promise<array|object>} An array of wallets or single wallet description
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
        apiKey: this.apiKey,
      });
      if (walletId) {
        delete resp.data.wallet.privateKey;
        return resp.data.wallet;
      }

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
   * @return {Promise<array>} Array of withdrawals
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
        apiKey: this.apiKey,
      });
      return resp.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Fetches all the deposits happend for a wallet
   * @param  {string} walletId Id of the wallet for which the transactions need to be fetched
   * @example <caption>Fetches all deposits for a wallet</caption>
   * const deposits = await paymeter.getDeposits('abcdefghi');
   * console.log(deposits);
   * // Prints [{...deposit1}, {...}, ...]
   * @return {Promise<array>} Array of deposits
   * @memberof Paymeter
   */
  async getDeposits(walletId) {
    const path = `/api/paymeter/wallets/${walletId}/deposits`;

    if (!walletId) {
      return Promise.reject(new Error('walletId is a required option'));
    }

    try {
      const resp = await helpers.sendPlatformRequest({
        path,
        method: 'GET',
        apiKey: this.apiKey,
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
   * @param {string} [options.feeWalletId] Only for ERC20 tokens, wallet Id from where the transaction fee is to be deducted
   * @param {string} [options.feeWalletPassword] Only for ERC20 tokens, password for the feeWallet specified <i>(<b>Required</b> if feeWalletId is specified)</i>
   * @param {string} [options.feeCollectWalletId] Wallet ID to which the gas fees is to be collected
   * @param {string} [options.tokenValueInEth] Value of ERC20 token in ETH i.e., 1 ERC20 Token = ? ETH <i>(<b>Required</b> if feeCollectWalletId is specified)</i>
   * @param {boolean} [options.sendExactAmount] If true, then sends exact amount to the receiver. Total amount debited will be the specified amount + network charges. If false, network charges will be debited from the specified amount
   * @param {string(hex)} [options.data] Raw transaction data to call functions of smart contract. Only applicable for ETH wallets
   * @example <caption>Transfers tokens (Fees debited from the amount specified)</caption>
   * const txnId = await paymeter.send({
   *   fromWalletId: 'wallet1ID',
   *   toAddress: '0x1234567890abcdef',
   *   amount: 1,
   *   password: 'wallet1Password'
   * });
   * console.log(txnId);
   * // Prints 0x...
   * @example <caption>Transfers tokens (Fees debited above the specifed amount)</caption>
   * const txnId = await paymeter.send({
   *   fromWalletId: 'wallet1ID',
   *   toAddress: '0x1234567890abcdef',
   *   amount: 1,
   *   password: 'wallet1Password'
   *   sendExactAmount: true
   * });
   * console.log(txnId);
   * // Prints 0x...
   * @example <caption>Transfers token from but fees deducted from another wallet</caption>
   * const txnId = await paymeter.send({
   *   fromWalletId: 'wallet1ID',
   *   toAddress: '0x1234567890abcdef',
   *   amount: 1,
   *   password: 'wallet1Password'
   *   feeWalletId: 'wallet2ID',
   *   feeWalletPassword: 'wallet2Password'
   * });
   * console.log(txnId);
   * // Prints 0x...
   * @example <caption>Transfers token from with fees credits to separate wallet</caption>
   * const txnId = await paymeter.send({
   *   fromWalletId: 'wallet1ID',
   *   toAddress: '0x1234567890abcdef',
   *   amount: 1,
   *   password: 'wallet1Password'
   *   feeCollectWalletId: 'wallet3ID',
   * });
   * console.log(txnId);
   * // Prints 0x...
   * @example <caption>Transfers token using raw transactions</caption>
   * const contractAddress = '0x12341234567890abcd';
   * const contract = new web3.eth.Contract(abi, contractAddress);
   * const data = await contract.methods.sign().encodeABI();
   * const txnId = await paymeter.send({
   *   fromWalletId: 'wallet4ID',
   *   password: 'wallet4Password',
   *   toAddress: contractAddress,
   *   data: data,
   * });
   * console.log(txnId);
   * // Prints 0x...
   * @return {Promise<string>} Transaction id
   * @memberof Paymeter
   */
  async send({ fromWalletId, toAddress, amount, password, feeWalletId, feeWalletPassword, feeCollectWalletId, tokenValueInEth, sendExactAmount, data }) {
    if (!fromWalletId) {
      return Promise.reject(new Error('walletId is a required option'));
    }

    if (!(fromWalletId && toAddress && amount && password)) {
      return Promise.reject(new Error('fromWalletId,  toAddress,  amount, password are required fields'));
    }

    const path = `/api/paymeter/wallets/${fromWalletId}/send`;

    const body = {
      toAddress,
      amount,
      options: {
        password,
      },
    };

    if (feeWalletId) {
      body.options.feeWalletId = feeWalletId;
      body.options.feeWalletPassword = feeWalletPassword;
    }

    if (feeCollectWalletId) {
      body.options.feeCollectWalletId = feeCollectWalletId;
      body.options.tokenValueInEth = tokenValueInEth;
    }

    if (sendExactAmount) {
      body.options.sendExactAmount = sendExactAmount;
    }

    if (data) {
      body.options.data = data;
    }

    try {
      const resp = await helpers.sendPlatformRequest({
        path,
        method: 'POST',
        body,
        apiKey: this.apiKey,
      });
      return resp.data.txnHash || resp.data.txnId;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Force refreshes balance in a wallet. This can be used in case deposits are coming from a smart contract
   * @param  {string} walletId ID of the wallet to refresh balance of
   * @return {Promise<boolean>} True if call succeeded
   * @memberof Paymeter
   */
  async refreshBalance(walletId) {
    if (!walletId) {
      return Promise.reject(new Error('WalletID is a required argument to refreshBalance'));
    }

    const path = `/api/paymeter/wallets/${walletId}/refreshBalance`;
    try {
      await helpers.sendPlatformRequest({
        path,
        method: 'GET',
        apiKey: this.apiKey,
      });
      return true;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Paymeter;
