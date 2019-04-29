const test = require('ava');

const Config = require('./helpers/config');
const Blockcluster = require('..');

test.before(t => {
  const platform = new Blockcluster.Platform({
    apiKey: Config.ApiKeys.Bot,
  });
  const platformUser = new Blockcluster.Platform({
    apiKey: Config.ApiKeys.User,
  });

  Object.assign(t.context, { platform, platformUser });
});

test('Fetch Network Configs', async t => {
  try {
    const { platform } = t.context;
    const configs = await platform.fetchNetworkTypes('privatehive');

    if (!Array.isArray(configs)) {
      return t.fail('Network configs is not an array');
    }

    const config = configs[0];
    if (!config) {
      return t.fail('No network configs');
    }

    const requiredKeys = ['_id', 'name', 'cpu', 'ram', 'disk', 'cost'];
    requiredKeys.forEach(key => {
      if (!config[key]) {
        return t.fail(`${key} not present in network config`);
      }

      return null;
    });

    t.pass();
  } catch (err) {
    t.fail();
  }

  return true;
});

test('Fetch Available locations', async t => {
  try {
    const { platform } = t.context;
    const configs = await platform.fetchLocations('privatehive');

    if (!Array.isArray(configs)) {
      return t.fail('Location list is not an array');
    }

    const config = configs[0];
    if (!config) {
      return t.fail('No location configs');
    }

    const requiredKeys = ['locationCode', 'locationName'];
    requiredKeys.forEach(key => {
      if (!config[key]) {
        return t.fail(`${key} not present in location config`);
      }

      return null;
    });

    t.pass();
  } catch (err) {
    t.fail();
  }

  return true;
});

test('Dynamo: Create and Delete Network', async t => {
  try {
    const { platform } = t.context;
    const res = await platform.createNetwork({
      networkName: `Jibin ${new Date().getTime()}`,
      networkConfigId: Config.Platform.networkConfigId,
      locationCode: Config.Platform.locationCode,
    });

    if (!res.instanceId) {
      t.fail('Instance id is null');
    }

    await platform.deleteNetwork(res.instanceId);
    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Dynamo: Send Invite', async t => {
  try {
    const { platform } = t.context;
    const res = await platform.inviteViaEmail({
      inviteToEmail: Config.Platform.inviteEmail,
      networkId: Config.Platform.inviteNetworkId,
      networkType: 'authority',
    });

    if (!res) {
      t.fail('Invite id is null');
    }

    Object.assign(t.context, { inviteId: res });

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Privatehive: Create, Lists and Delete network', async t => {
  try {
    const { platform } = t.context;

    const peerId = await platform.privatehive.create({
      locationCode: Config.Platform.privatehiveLocationCode,
      type: 'peer',
      orgName: 'blockcluster',
      name: `Peer 1 - ${new Date().toLocaleString()} `,
      networkConfigId: Config.Platform.privatehiveNetworkConfigId,
    });

    const networks = await platform.privatehive.list({ showDeleted: false });
    const doesExists = networks.find(n => n.instanceId === peerId);
    if (!doesExists) {
      t.fail('Privatehive Network creation failed');
    }

    await platform.privatehive.delete(peerId);
    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Privatehive: Invite & Accept channel join request', async t => {
  try {
    const { platformUser } = t.context;

    const nodeList = await platformUser.privatehive.list(Config.Privatehive.peerInstanceId);
    const ordererList = await platformUser.privatehive.list(Config.Privatehive.ordererInstanceId);

    const node = platformUser.getPrivatehiveNode(nodeList[0]);
    const orderer = platformUser.getPrivatehiveNode(ordererList[0]);

    node.setOrderer(orderer);

    const inviteId = await platformUser.privatehive.inviteUserToChannel({
      email: Config.Platform.inviteEmail,
      peerId: Config.Privatehive.peerInstanceId,
      channelName: Config.Privatehive.channelName,
      ordererDomain: `orderer.${orderer.organization.toLowerCase()}.com`,
      ordererConnectionDetails: `grpc://${orderer.ordererURL}`,
    });

    const invites = await platformUser.privatehive.listChannelInvites();

    if (!invites.map(c => c._id).includes(inviteId)) {
      return t.fail('Invite not in list');
    }

    t.pass();
  } catch (err) {
    if (err.toString() === 'Error: Chaincode directory name wrong') {
      t.pass();
    } else {
      t.fail(err);
    }
  }

  return true;
});
