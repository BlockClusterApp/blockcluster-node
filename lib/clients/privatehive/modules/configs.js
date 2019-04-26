const { RequestTypes } = require('../../../helpers/requests');

module.exports = node => ({
  async ordererCerts() {
    const res = await node.__constructNodeRequest('/config/ordererCerts', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  async orgDetails() {
    const res = await node.__constructNodeRequest('/config/orgDetails', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
  async connectionProfile() {
    const res = await node.__constructNodeRequest('/config/connectionProfile', RequestTypes.GET);
    if (res.error) {
      throw new Error(res.message);
    }

    return res.message;
  },
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
