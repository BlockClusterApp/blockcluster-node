const { RequestTypes } = require('../../../helpers/requests');

module.exports = node => ({
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
