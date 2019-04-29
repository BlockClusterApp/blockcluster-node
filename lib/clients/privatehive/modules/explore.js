const { RequestTypes } = require('../../../helpers/requests');

/**
 * @typedef Block
 */

/**
 * @typedef Transaction
 */

/**
 *
 * @namespace Explore
 * @since 3.0.1
 */
module.exports = node => ({
  /**
   * Fetches the latest block
   * @function
   * @name latestBlock
   * @param  {string} channelName Name of the channel whose latest block is to be fetched.
   * @returns {Block} Response from server
   * @memberof Explore
   * @method
   * @instance
   */
  async latestBlock(channelName) {
    if (!channelName) {
      throw new Error('Explore latestBlock error : channelName is required');
    }

    const res = await node.__constructNodeRequest(`/explore/getLatestBlock?channelName=${channelName}`, RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches transaction details by transaction id
   * @function
   * @name transaction
   * @param  {string} channelName Name of the channel whose latest block is to be fetched.
   * @param {string} txnId Transaction ID
   * @returns {Transaction} Response from server
   * @memberof Explore
   * @method
   * @instance
   */
  async transaction(channelName, txnId) {
    if (!channelName) {
      throw new Error('Explore transaction error : channelName is required');
    }

    if (!txnId) {
      throw new Error('Explore transaction error : TxnId is required');
    }

    const res = await node.__constructNodeRequest(`/explore/getTransaction?channelName=${channelName}&txnId=${txnId}`, RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the latest list of blocks
   * @function
   * @name blocks
   * @param  {string} channelName Name of the channel whose latest block is to be fetched.
   * @returns {Array<Block>} Response from server
   * @memberof Explore
   * @method
   * @instance
   */
  async blocks(channelName) {
    if (!channelName) {
      throw new Error('Explore blocks error : channelName is required');
    }

    const res = await node.__constructNodeRequest(`/explore/getBlocks?channelName=${channelName}`, RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the list of organizations who joined the channel
   * @function
   * @name listOrgs
   * @param  {string} channelName Name of the channel whose latest block is to be fetched.
   * @returns {Array<string>} Response from server
   * @memberof Explore
   * @method
   * @instance
   */
  async listOrgs(channelName) {
    if (!channelName) {
      throw new Error('Explore listOrgs error : channelName is required');
    }

    const res = await node.__constructNodeRequest(`/explore/organisations?channelName=${channelName}`, RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the details of the block number provided
   * @function
   * @name block
   * @param  {string} channelName Name of the channel whose latest block is to be fetched.
   * @param {int} blockNumber Block number of the block whose details is to be fetched
   * @returns {Block} Response from server
   * @memberof Explore
   * @method
   * @instance
   */
  async block(channelName, blockNumber) {
    if (!channelName) {
      throw new Error('Explore block error : channelName is required');
    }

    const res = await node.__constructNodeRequest(`/explore/getLatestBlock?channelName=${channelName}&blockNumber=${blockNumber}`, RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the list of chaincodes instantiated on the channel
   * @function
   * @name chaincodesInstantiated
   * @param  {string} channelName Name of the channel whose latest block is to be fetched.
   * @returns {Array<ChaincodeType>} Response from server
   * @memberof Explore
   * @method
   * @instance
   */
  async chaincodesInstantiated(channelName) {
    if (!channelName) {
      throw new Error('Explore chaincodesInstantiated error : channelName is required');
    }

    const res = await node.__constructNodeRequest(`/explore/chaincodesInstantiated?channelName=${channelName}`, RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
});
