const fs = require('fs');

const { RequestTypes } = require('../../../helpers/requests');

module.exports = node => ({
  /**
   * Adds a chaincode to the peer. This does not install or instantiate the chaincode but only uploads them.
   * @param  {string} filePath Path of the zip file where the chaincode is residing
   * @param  {string} name Name of chaincode
   * @param  {golang|node} type Type of chaincode
   * @return {Promise<string>} Response from node
   * @memberof PrivatehiveNode.chaincode
   */
  async add(filePath, name, type) {
    if (!name) {
      throw new Error('Chaincode add error : name is required');
    }

    if (!filePath) {
      throw new Error('Chaincode add error : filePath is required');
    }

    if (!['golang', 'node'].includes(type)) {
      throw new Error('Chaincode add error : type should be golang or node');
    }

    const addReq = node.__constructNodeRequest('/chaincodes/add', RequestTypes.POST, {}, {}, true);
    const form = addReq.form();

    form.append('chaincode_zip', fs.createReadStream(filePath));
    form.append('chaincodeName', name);
    form.append('chaincodeLanguage', type);

    const res = await addReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return res;
  },
  /**
   * Installs an already added chaincode to the peer
   * @param  {string} name Name of the chaincode
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode.chaincodes
   */
  async install(name) {
    if (!name) {
      throw new Error('Chaincode instantiate error : name is required');
    }

    const installReq = node.__constructNodeRequest('/chaincodes/install', RequestTypes.POST, {
      chaincodeName: name,
    });

    const res = await installReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Instantiates an installed chaincode to a channel and on this peer
   * @param  {object} params Options
   * @property {string} params.name Name of the chaincode to instantiate
   * @property {string} params.channelName Channel on which the code is to be instantiated
   * @property {string} [params.functionName] Name of function to be called for instantiation. Default is init
   * @property {Array<string>} [params.args] Arguments to the instantiating function . Default is []
   * @property {object} [params.endorsementPolicy] Endoresement policy for this chaincode. By default any of the org should sign
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode.chaincodes
   */
  async instantiate({ name, channelName, functionName, args, endorsementPolicy }) {
    if (!Array.isArray(args)) {
      throw new TypeError('Chaincode instantiate error : args should be a json array');
    }

    if (!channelName) {
      throw new Error('Chaincode instantiate error : channelName is required');
    }

    if (!name) {
      throw new Error('Chaincode instantiate error : name is required');
    }

    const instantiateReq = node.__constructNodeRequest('/chaincodes/instantiate', RequestTypes.POST, {
      chaincodeName: name,
      channelName,
      functionName,
      args,
      endorsmentPolicy: endorsementPolicy,
    });
    const res = await instantiateReq;
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   *  Returns list of all the chaincodes
   * @return {Promise<Array<string>>} List of chaincodes
   * @memberof PrivatehiveNode.chaincodes
   */
  async list() {
    const res = await node.__constructNodeRequest('/chaincodes/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
});
