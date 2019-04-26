const { RequestTypes } = require('../../../helpers/requests');

/**
 * @namespace Config
 */

module.exports = node => ({
  /**
   * Fetches the orderer certs for the node
   * @function
   * @name ordererCerts
   * @return {OrdererCerts} Orderer Certs
   * @memberof Config
   * @method
   * @instance
   */
  async ordererCerts() {
    const res = await node.__constructNodeRequest('/config/ordererCerts', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the organization details
   * @function
   * @name orgDetails
   * @return {OrgDetails} Organization Details
   * @memberof Config
   * @method
   * @instance
   */
  async orgDetails() {
    const res = await node.__constructNodeRequest('/config/orgDetails', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the connection profile for the node
   * @function
   * @name ordererCerts
   * @return {ConnectionProfile} Connection profile of the node
   * @memberof Config
   * @method
   * @instance
   */
  async connectionProfile() {
    const res = await node.__constructNodeRequest('/config/connectionProfile', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  /**
   * Fetches the crypto config for the node
   * @function
   * @name cryptoConfig
   * @param {WriteStream} writeStream Write stream to which the contents will be written
   * @return {Boolean} True is successfully downloaded
   * @memberof Config
   * @method
   * @instance
   */
  async cryptoConfig(writeStream) {
    if (!writeStream) {
      throw new Error('CryptoConfig download error : writeStream is required to write the file');
    }

    const req = node.__constructNodeRequest('/config/cryptoConfig', RequestTypes.GET);
    req.pipe(writeStream);
    const res = await req;
    if (res.error) {
      throw new Error(res.message);
    }

    return true;
  },
});