const BlockCluster = require('../..');
const Config = require('./config');

function before(t) {
  const node = new BlockCluster.Dynamo({
    locationDomain: Config.Dynamo.locationDomain,
    instanceId: Config.Dynamo.instanceId,
  });

  Object.assign(t.context, { node });
}

module.exports = { before };
