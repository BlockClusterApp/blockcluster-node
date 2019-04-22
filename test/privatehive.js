const test = require('ava');

const Config = require('./helpers/config');
const Blockcluster = require('..');

test.before(async t => {
  const platform = new Blockcluster.Platform({
    apiKey: Config.ApiKeys.User,
  });

  const nodeList = await platform.listPrivatehiveNetworks(Config.Privatehive.peerInstanceId);
  const ordererList = await platform.listPrivatehiveNetworks(Config.Privatehive.ordererInstanceId);

  const node = platform.getPrivatehiveNode(nodeList[0]);
  const orderer = platform.getPrivatehiveNode(ordererList[0]);

  node.setOrderer(orderer);

  Object.assign(t.context, { fabric: node, orderer });
});

test('Can create channel', async t => {
  try {
    const { fabric } = t.context;
    const channelName = `test-channel-${new Date().getTime()}`;
    const createChannelResponse = await fabric.createChannel(channelName);
    console.log('Created channel', createChannelResponse);
    const channels = await fabric.fetchChannels();

    if (!Array.isArray(channels)) {
      return t.fail('Channel list is not an array');
    }
    if (channels.map(c => c.name).includes(channelName)) {
      t.pass();
    } else {
      t.fail('Channel not in list');
    }
  } catch (err) {
    t.fail(err);
  }
  return true;
});
