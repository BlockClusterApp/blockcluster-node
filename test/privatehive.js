const test = require('ava');
const path = require('path');
const fs = require('fs');

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

  Object.assign(t.context, { fabric: node, orderer, platform });
});

test('Create & Fetch channel', async t => {
  try {
    const { fabric } = t.context;
    const channelName = `test-channel-${new Date().getTime()}`;
    await fabric.createChannel(channelName);
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

test('Add & Fetch chaincode', async t => {
  const chaincodeName = `example-${new Date().getTime()}`;
  const chaincodeOriginalFile = path.join(__dirname, '..', 'example_cc.zip');
  const chaincodeNewFile = path.join(__dirname, '..', `${chaincodeName}.zip`);
  fs.copyFileSync(chaincodeOriginalFile, chaincodeNewFile);
  try {
    const { fabric } = t.context;

    await fabric.addChaincode(chaincodeNewFile, chaincodeName, 'golang');

    const chaincodes = await fabric.fetchChaincodes();

    if (!chaincodes.map(c => c.name).includes(chaincodeName)) {
      return t.fail('Chaincode not in list');
    }

    t.pass();
  } catch (err) {
    if (err.toString() === 'Error: Chaincode directory name wrong') {
      t.pass();
    } else {
      t.fail(err);
    }
  } finally {
    fs.unlinkSync(chaincodeNewFile);
  }

  return true;
});
