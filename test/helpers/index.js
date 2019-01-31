const BlockCluster = require('../..');

function before(t) {
  const node = new BlockCluster.Dynamo({
    locationDomain: process.env.locationDomain || 'test.blockcluster.io',
    instanceId: process.env.instanceId || 'npcqjdik',
  });

  Object.assign(t.context, { node });
}

module.exports = { before };
