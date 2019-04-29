const fs = require('fs');

const { RequestTypes } = require('../../../helpers/requests');

/**
 * @typedef ChaincodeType
 * @property {string} version Chaincode version
 * @property {string} name Name of the chaincode
 * @property {string} language Language in which the chaincode is written
 */

/**
 *
 * @namespace Chaincode
 * @since 3.0.1
 */
module.exports = node => ({
  /**
   * Adds a chaincode to the peer. This does not install or instantiate the chaincode but only uploads them.
   * @function
   * @name add
   * @param  {string} filePath Path of the zip file where the chaincode is residing
   * @param  {string} name Name of chaincode
   * @param  {golang|node} type Type of chaincode
   * @returns {Promise<string>} Response from node
   * @memberof Chaincode
   * @method
   * @instance
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
   * @function
   * @name install
   * @param  {string} name Name of the chaincode
   * @returns {Promise<string>} Response from the node
   * @memberof Chaincode
   * @method
   * @instance
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
   * @function
   * @param  {object} params Options
   * @param {string} params.name Name of the chaincode to instantiate
   * @param {string} params.channelName Channel on which the code is to be instantiated
   * @param {string} [params.functionName] Name of function to be called for instantiation. Default is init
   * @param {Array<string>} [params.args] Arguments to the instantiating function . Default is []
   * @param {object} [params.endorsementPolicy] Endoresement policy for this chaincode. By default any of the org should sign
   * @returns {Promise<string>} Response from the node
   * @memberof Chaincode
   * @method
   * @instance
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
   * @function
   * @returns {Promise<Array<ChaincodeType>>} List of chaincodes
   * @memberof Chaincode
   * @method
   * @instance
   */
  async list() {
    const res = await node.__constructNodeRequest('/chaincodes/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   *  Invokes a function on a chaincode
   * @function
   * @param {object} options Params
   * @param {string} options.chaincodeName Name of the chaincode to invoke
   * @param {stirng} options.channelName Channel on which the chaincode is instantiated
   * @param {string} options.fcn Function name to invoke
   * @param {Array<string>} options.args Array of string to be passed as argument to the invoke function
   * @returns {Promise<string>} Invoke result
   * @memberof Chaincode
   * @method
   * @instance
   */
  async invoke({ chaincodeName, channelName, fcn = 'init', args = [] }) {
    if (!chaincodeName) {
      throw new Error('Chaincode invoke error : chaincodeName is required');
    }

    if (!channelName) {
      throw new Error('Chaincode invoke error: channelName is required');
    }

    const res = await node.__constructNodeRequest('/chaincodes/invoke', RequestTypes.POST, {
      chaincodeName,
      channelName,
      args,
      fcn,
    });
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },

  /**
   *  Queries a chaincode using a function
   * @function
   * @param {object} options Params
   * @param {string} options.chaincodeName Name of the chaincode to query
   * @param {stirng} options.channelName Channel on which the chaincode is instantiated
   * @param {string} options.fcn Function name to use for querying
   * @param {Array<string>} options.args Array of string to be passed as argument to the query function
   * @returns {Promise<string>} Query response
   * @memberof Chaincode
   * @method
   * @instance
   */
  async query({ chaincodeName, channelName, fcn, args = [] }) {
    if (!chaincodeName) {
      throw new Error('Chaincode query error : chaincodeName is required');
    }

    if (!channelName) {
      throw new Error('Chaincode query error: channelName is required');
    }

    if (!fcn) {
      throw new Error('Chaincode query error: fcn is required');
    }

    const res = await node.__constructNodeRequest('/chaincodes/query', RequestTypes.POST, {
      chaincodeName,
      channelName,
      args,
      fcn,
    });
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   *  Upgrades an existing chaincode
   * @function
   * @param {object} options Params
   * @param {string} options.filePath Absolute file path where the chaincode .zip file is stored
   * @param {stirng} options.name Name of chaincode to upgrade
   * @param {string} options.chaincodeVersion New chaincode version
   * @param {stirng} options.channelName Channel on which the chaincode is instantiated
   * @param {Array<string>} options.args Array of string to be passed as argument to the invoke function
   * @returns {Promise<string>} Upgrade result
   * @memberof Chaincode
   * @method
   * @instance
   */
  async upgrade({ filePath, name, chaincodeVersion, args = [], channelName }) {
    if (!name) {
      throw new Error('Chaincode upgrade error : name is required');
    }

    if (!filePath) {
      throw new Error('Chaincode upgrade error : filePath is required');
    }

    if (!chaincodeVersion) {
      throw new Error('Chaincode upgrade error : chaincodeVersion is required');
    }

    if (!channelName) {
      throw new Error('Chaincode upgrade error : channelName is required');
    }

    const upgradeReq = node.__constructNodeRequest('/chaincodes/upgrade', RequestTypes.POST, {}, {}, true);
    const form = upgradeReq.form();

    form.append('chaincode_zip', fs.createReadStream(filePath));
    form.append('chaincodeName', name);
    form.append('chaincodeVersion', chaincodeVersion);
    form.append('args', args);
    form.append('channelName', channelName);

    const res = await upgradeReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return res;
  },
});
