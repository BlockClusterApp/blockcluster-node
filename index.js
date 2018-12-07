/* eslint-disable global-require */

module.exports = {
  Platform: require('./lib/clients/platform'),
  Dynamo: require('./lib/clients/dynamo'),
  Hyperion: require('./lib/clients/hyperion')
};
