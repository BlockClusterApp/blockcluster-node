const fs = require('fs');
const request = require('request-promise');

const RequestTypes = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

/**
 * Handles all functions related to the blockcluster platform operation
 * @property {Channel} channels Channel related functions
 * @property {Chaincode} chaincodes Chaincode related functions
 * @property {Notification} notifications Notification related functions
 * @property {Explore} explore Explorer related functions
 * @property {Config} configs Download configs
 * @class PrivatehiveNode
 */
class PrivatehiveNode {
  /**
   * Creates an instance of PrivatehiveNode.
   * @param  {object} options Params
   * @property {string} options.name Name of the node
   * @property {string} options.instanceId Instance ID of the node
   * @property {string} options.orgName Organization of the node
   * @property {string} options.locationCode Location code of the cluster the node is deployed at
   * @property {string} options.domain Node API host, got from Node -> Security
   * @property {peer|orderer}  options.type Type of node
   * @property {IP} options.workerNodeIP IP Address of the worker node
   * @property {int} options.ordererNodePort Port number at which the orderer is accesible
   * @property {object} [options.details] More options
   * @memberof PrivatehiveNode
   */
  constructor({ name, instanceId, orgName, locationCode, domain, type, workerNodeIP, ordererNodePort, ...details }) {
    this.name = name;
    this.instanceId = instanceId;
    this.organization = orgName;
    this.locationCode = locationCode;
    this.type = type || 'peer';

    Object.keys(details).forEach(key => {
      this[key] = details[key];
    });

    if (type === 'orderer' || this.nodeType === 'orderer') {
      this.ordererURL = `${workerNodeIP}:${ordererNodePort}`;
    }

    this.domain = domain || 'https://app.blockcluster.io';

    if (!['peer', 'orderer'].includes(this.type)) {
      throw new Error('Privatehive peer type should be peer or orderer');
    }

    this.addResources();
  }

  __constructNodeRequest(path, method, body = {}, headers = {}, returnAgent = false) {
    const tempHeaders = {};

    if (this.username && this.password) {
      tempHeaders.Authorization = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }

    if (!headers.Authorization) {
      headers = { ...headers, ...tempHeaders };
    }

    this.BASE_URL = `${this.domain}/api/privatehive/${this.instanceId}`;
    if (returnAgent) {
      return request({
        uri: `${this.BASE_URL}${path}`,
        method,
        headers,
        json: true,
        timeout: 120 * 1000,
      });
    }

    return request({
      uri: `${this.BASE_URL}${path}`,
      method,
      headers,
      body,
      json: true,
      timeout: 120 * 1000,
    });
  }

  /**
   * Sets the basic authentication for the node. If not enabled from the dashboard then not required. It won't be set by default when fetching node information
   * @param  {string} username Basic Auth username
   * @param  {string} password Basic Auth password
   * @return {void}
   * @memberof PrivatehiveNode
   */
  setAuth(username, password) {
    this.username = username;
    this.password = password;
  }

  /**
   * Sets the domain where the node is accessible
   * @param  {string} domain Host name as got from Node -> Security
   * @return {void}
   * @memberof PrivatehiveNode
   */
  setDomain(domain) {
    this.domain = domain;
  }

  /**
   * Sets orderer for this peer
   * @param  {PrivatehiveNode} orderer Orderer node
   * @return {void}
   * @memberof PrivatehiveNode
   */
  setOrderer(orderer) {
    if (this.type !== 'peer') {
      console.error('node.setOrderer is only valid for peer type nodes');
      return;
    }

    this.orderer = orderer;
    this.orderer.ordererURL = `${orderer.ordererURL}`;
  }

  addResources() {
    Object.assign(this, {
      channels: require('./modules/channel')(this),
      chaincodes: require('./modules/chaincodes')(this),
      notifications: require('./modules/notifications')(this),
      explore: require('./modules/explore')(this),
      configs: require('./modules/configs')(this),
    });
  }

  /**
   * Creates a channel in the privatehive node
   * @deprecated Since v2.1.1. Use PrivatehiveNode.channels.create
   * @param  {string} name Name of the channel to be created
   * @param  {string} [ordererURL] GRPC url (without the protocol) of the orderer
   * @param  {string} [ordererDomain] Orderer's organization domain
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode
   */
  async createChannel(name, ordererURL = '', ordererDomain = '') {
    console.warn('PrivatehiveNode.createChannel is deprecated. Use PrivatehiveNode.channels.create instead');
    if (!name) {
      throw new Error('Channel create error : name is required');
    }

    if (!ordererURL && !(this.orderer && this.orderer.ordererURL)) {
      throw new Error('Channel create error : Orderer URL is missing. Specifiy orderer url or set orderer to this node');
    }

    if (!ordererDomain && !(this.orderer && this.orderer.organization)) {
      throw new Error('Channel create error : Orderer organization name is missing. Specifiy orderer url or set orderer to this node');
    }

    const channelReq = this.__constructNodeRequest('/channel/create', RequestTypes.POST, {
      name,
      ordererDomain: ordererDomain || `orderer.${this.orderer.organization.toLowerCase()}.com`,
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
   * @deprecated Since v2.1.1. Use PrivatehiveNode.channels.list
   * @return {Promise<Array<string>>} List of channels
   * @memberof PrivatehiveNode
   */
  async fetchChannels() {
    console.warn('PrivatehiveNode.fetchChannels is deprecated. Use PrivatehiveNode.channels.list instead');
    const res = await this.__constructNodeRequest('/channels/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  }

  /**
   * Adds a chaincode to the peer. This does not install or instantiate the chaincode but only uploads them.
   * @deprecated Since v2.1.1. Use PrivatehiveNode.chaincodes.add
   * @param  {string} filePath Path of the zip file where the chaincode is residing
   * @param  {string} name Name of chaincode
   * @param  {golang|node} type Type of chaincode
   * @return {Promise<string>} Response from node
   * @memberof PrivatehiveNode
   */
  async addChaincode(filePath, name, type) {
    console.warn('PrivatehiveNode.addChaincode is deprecated. Use PrivatehiveNode.chaincodes.add instead');
    if (!name) {
      throw new Error('Chaincode add error : name is required');
    }

    if (!filePath) {
      throw new Error('Chaincode add error : filePath is required');
    }

    if (!['golang', 'node'].includes(type)) {
      throw new Error('Chaincode add error : type should be golang or node');
    }

    const addReq = this.__constructNodeRequest('/chaincodes/add', RequestTypes.POST, {}, {}, true);
    const form = addReq.form();

    form.append('chaincode_zip', fs.createReadStream(filePath));
    form.append('chaincodeName', name);
    form.append('chaincodeLanguage', type);

    const res = await addReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return res;
  }

  /**
   * Installs an already added chaincode to the peer
   * @deprecated Since v2.1.1. Use PrivatehiveNode.chaincodes.install
   * @param  {string} name Name of the chaincode
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode
   */
  async installChaincode(name) {
    console.warn('PrivatehiveNode.installChaincode is deprecated. Use PrivatehiveNode.chaincodes.install instead');
    if (!name) {
      throw new Error('Chaincode instantiate error : name is required');
    }

    const installReq = this.__constructNodeRequest('/chaincodes/install', RequestTypes.POST, {
      chaincodeName: name,
    });

    const res = await installReq;

    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  }

  /**
   * Instantiates an installed chaincode to a channel and on this peer
   * @deprecated Since v2.1.1. Use PrivatehiveNode.chaincodes.instantiate
   * @param  {object} params Options
   * @property {string} params.name Name of the chaincode to instantiate
   * @property {string} params.channelName Channel on which the code is to be instantiated
   * @property {string} [params.functionName] Name of function to be called for instantiation. Default is init
   * @property {Array<string>} [params.args] Arguments to the instantiating function . Default is []
   * @property {object} [params.endorsementPolicy] Endoresement policy for this chaincode. By default any of the org should sign
   * @return {Promise<string>} Response from the node
   * @memberof PrivatehiveNode
   */
  async instantiateChaincode({ name, channelName, functionName, args, endorsementPolicy }) {
    console.warn('PrivatehiveNode.instantiateChaincode is deprecated. Use PrivatehiveNode.chaincodes.instantiate instead');
    if (!Array.isArray(args)) {
      throw new TypeError('Chaincode instantiate error : args should be a json array');
    }

    if (!channelName) {
      throw new Error('Chaincode instantiate error : channelName is required');
    }

    if (!name) {
      throw new Error('Chaincode instantiate error : name is required');
    }

    const instantiateReq = this.__constructNodeRequest('/chaincodes/instantiate', RequestTypes.POST, {
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
  }

  /**
   *  Returns list of all the chaincodes
   * @deprecated Since v2.1.1. Use PrivatehiveNode.chaincodes.list
   * @return {Promise<Array<string>>} List of chaincodes
   * @memberof PrivatehiveNode
   */
  async fetchChaincodes() {
    console.warn('PrivatehiveNode.fetchChaincodes is deprecated. Use PrivatehiveNode.chaincodes.list instead');
    const res = await this.__constructNodeRequest('/chaincodes/list', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }
}

module.exports = PrivatehiveNode;
