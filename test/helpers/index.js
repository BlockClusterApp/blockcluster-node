const BlockCluster = require('../..');

function before(t) {
  const node = new BlockCluster.Dynamo({
    locationDomain: 'dev.blockcluster.io',
    instanceId: 'vybrmmke'
  });

  Object.assign(t.context, { node });
}

module.exports = { before };
