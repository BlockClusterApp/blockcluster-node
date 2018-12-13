const BlockCluster = require('../..');

function before(t) {
  const node = new BlockCluster.Dynamo({
    locationDomain: process.env.locationDomain || 'dev.blockcluster.io',
    instanceId: process.env.instanceId || 'rklqiprt',
  });

  Object.assign(t.context, { node });
}

module.exports = { before };
