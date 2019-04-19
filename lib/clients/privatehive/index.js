const fs = require('fs');
const request = require('request-promise');

/**
 * Handles all functions related to the blockcluster platform operation
 * @class PrivatehiveNode
 */
class PrivatehiveNode {
  constructor({ name, instanceId, orgName, locationCode, domain, type, ordererURL }) {
    this.name = name;
    this.instanceId = instanceId;
    this.organization = orgName;
    this.locationCode = locationCode;
    this.ordererURL = ordererURL;
    this.type = type || 'peer';

    if (!['peer', 'orderer'].includes(this.type)) {
      throw new Error('Privatehive peer type should be peer or orderer');
    }

    this.RequestTypes = {
      GET: 'GET',
      POST: 'POST',
      PUT: 'PUT',
      DELETE: 'DELETE',
    };

    this.BASE_URL = `${domain}/api/privatehive/${instanceId}`;
  }

  __constructNodeRequest(path, method, body = {}, headers = {}) {
    const tempHeaders = {};

    if (this.username && this.password) {
      tempHeaders.Authorization = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }

    if (!headers.Authorization) {
      headers = { ...headers, ...tempHeaders };
    }

    return request({
      uri: `${this.BASE_URL}${path}`,
      method,
      headers,
      body,
      json: true,
    });
  }

  setAuth(username, password) {
    this.username = username;
    this.password = password;
  }

  /**
   * Sets orderer for this peer
   * @param  {PrivatehiveNode} orderer
   * @return {void}
   * @memberof PrivatehiveNode
   */
  setOrderer(orderer) {
    if (this.type === 'peer') {
      console.error('node.setOrderer is only valid for peer type nodes');
      return;
    }

    this.orderer = orderer;
  }

  /**
   * Creates a channel in the privatehive node
   * @param  {string} name Name of the channel to be created
   * @param  {string} [ordererURL] GRPC url (without the protocol) of the orderer
   * @param  {string} [ordererOrgName] Orderer's organization name
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode
   */
  async createChannel(name, ordererURL = '', ordererDomain = '') {
    if (!name) {
      throw new Error('Channel create error : name is required');
    }

    if (!ordererURL && !(this.orderer && this.orderer.ordererURL)) {
      throw new Error('Channel create error : Orderer URL is missing. Specifiy orderer url or set orderer to this node');
    }

    if (!ordererDomain && !(this.orderer && this.orderer.organization)) {
      throw new Error('Channel create error : Orderer organization name is missing. Specifiy orderer url or set orderer to this node');
    }

    const channelReq = this.__constructNodeRequest('/channel/create', this.RequestTypes.POST, {
      name,
      ordererDomain: ordererDomain || `orderer.${this.orderer.organization}.com`,
      ordererURL: ordererURL || this.orderer.ordererURL,
    });

    const res = await channelReq;
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  }

  /**
   * Returns list of all the channels
   * @return {Promise<Array<string>>}
   * @memberof PrivatehiveNode
   */
  async fetchChannels() {
    return this.__constructNodeRequest('/channels/list', this.RequestTypes.GET);
  }

  /**
   * Adds a chaincode to the peer. This does not install or instantiate the chaincode but only uploads them.
   * @param  {string} filePath Path of the zip file where the chaincode is residing
   * @param  {string} name Name of chaincode
   * @param  {golang|node} type Type of chaincode
   * @return {Promise<string>} Response from node
   * @memberof PrivatehiveNode
   */
  async addChaincode(filePath, name, type) {
    if (!name) {
      throw new Error('Chaincode add error : name is required');
    }

    if (!filePath) {
      throw new Error('Chaincode add error : filePath is required');
    }

    if (!['golang', 'node'].includes(type)) {
      throw new Error('Chaincode add error : type should be golang or node');
    }

    const addReq = this.__constructNodeRequest('/chaincodes/add', this.RequestTypes.POST);
    const form = addReq.form();

    form.append('chaincode_zip', fs.createReadStream(filePath));
    form.append('chaincodeName', name);
    form.append('chaincodeLanguage', type);

    const res = await addReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return true;
  }

  /**
   * Installs an already added chaincode to the peer
   * @param  {string} name Name of the chaincode
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode
   */
  async installChaincode(name) {
    if (!name) {
      throw new Error('Chaincode instantiate error : name is required');
    }

    const installReq = this.__constructNodeRequest('/chaincodes/install', this.RequestTypes.POST, {
      chaincodeName: name,
    });

    const res = await installReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return res;
  }

  /**
   * Instantiates an installed chaincode to a channel and on this peer
   * @param  {object} params
   * @property {string} params.name Name of the chaincode to instantiate
   * @property {string} params.channelName Channel on which the code is to be instantiated
   * @property {string} [params.functionName] Name of function to be called for instantiation. Default is init
   * @property {Array<string>} [params.args] Arguments to the instantiating function . Default is []
   * @property {object} [params.endorsementPolicy] Endoresement policy for this chaincode. By default any of the org should sign
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode
   */
  async instantiateChaincode({ name, channelName, functionName, args, endorsementPolicy }) {
    if (!Array.isArray(args)) {
      throw new TypeError('Chaincode instantiate error : args should be a json array');
    }

    if (!channelName) {
      throw new Error('Chaincode instantiate error : channelName is required');
    }

    if (!name) {
      throw new Error('Chaincode instantiate error : name is required');
    }

    const instantiateReq = this.__constructNodeRequest('/chaincodes/instantiate', this.RequestTypes.POST, {
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

    return res;
  }

  /**
   *  Returns list of all the chaincodes
   * @return {Promise<Array<string>>}
   * @memberof PrivatehiveNode
   */
  async fetchChaincodes() {
    return this.__constructNodeRequest('/chaincodes/list', this.RequestTypes.GET);
  }
}

module.exports = PrivatehiveNode;
