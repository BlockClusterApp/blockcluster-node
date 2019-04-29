const test = require('ava');
const path = require('path');
const fs = require('fs');

const Config = require('./helpers/config');
const Blockcluster = require('..');

test.before(async t => {
  const platform = new Blockcluster.Platform({
    apiKey: Config.ApiKeys.User,
    domain: Config.Privatehive.platformDomain,
  });

  const nodeList = await platform.privatehive.list(Config.Privatehive.peerInstanceId);
  const ordererList = await platform.privatehive.list(Config.Privatehive.ordererInstanceId);

  const node = platform.getPrivatehiveNode(nodeList[0]);
  const orderer = platform.getPrivatehiveNode(ordererList[0]);

  node.setDomain(Config.Privatehive.domain);
  orderer.setDomain(Config.Privatehive.domain);

  node.setOrderer(orderer);
  Object.assign(t.context, { fabric: node, orderer, platform });
});

test('Create & Fetch channel', async t => {
  try {
    const { fabric } = t.context;
    const channelName = `test-channel-${new Date().getTime()}`;
    await fabric.channels.create(channelName);
    const channels = await fabric.channels.list();
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

    await fabric.chaincodes.add(chaincodeNewFile, chaincodeName, 'golang');

    const chaincodes = await fabric.chaincodes.list();

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
  }

  fs.unlinkSync(chaincodeNewFile);
  return true;
});

test('Node config downloads', async t => {
  try {
    const { fabric } = t.context;

    const ordererCerts = await fabric.configs.ordererCerts();
    if (!(ordererCerts.adminCert && ordererCerts.caCert)) {
      return t.fail(`Orderer certs do not have admincerts and cacert. ${Object.keys(ordererCerts)}`);
    }

    const orgDetails = await fabric.configs.orgDetails();
    if (!(orgDetails.groups && orgDetails.policies)) {
      return t.fail(`Org details is not valid: ${Object.keys(orgDetails)}`);
    }

    await fabric.configs.connectionProfile();

    const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'tmp', 'crypto'));
    await fabric.configs.cryptoConfig(writeStream);
    fs.unlinkSync(path.join(__dirname, '..', 'tmp', 'crypto'));
    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Blocks and Transactions', async t => {
  try {
    const { fabric } = t.context;

    try {
      await fabric.explore.block(Config.Privatehive.channelName, 2);
    } catch (err) {
      if (!err.toString().includes('access denied')) {
        return t.fail(err);
      }
    }

    const orgs = await fabric.explore.listOrgs(Config.Privatehive.channelName);
    if (!Array.isArray(orgs)) {
      return t.fail('Channel org list is not an array');
    }

    try {
      await fabric.explore.blocks(Config.Privatehive.channelName);
    } catch (err) {
      if (!err.toString().includes('access denied')) {
        return t.fail(err);
      }
    }

    try {
      await fabric.explore.latestBlock(Config.Privatehive.channelName);
    } catch (err) {
      if (!err.toString().includes('access denied')) {
        return t.fail(err);
      }
    }

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Chaincode Notifications', async t => {
  try {
    const { fabric } = t.context;

    try {
      await fabric.notifications.add({
        chaincodeName: Config.Privatehive.chaincodeName,
        channelName: Config.Privatehive.channelName,
        chaincodeEventName: 'chaincodeDeployed',
        notificationURL: 'https://webhook.site/9025533e-e39e-4fcd-9df1-8a1960b27f3e',
      });
    } catch (err) {
      if (!err.toString().includes('Already added notification for this')) {
        return t.fail(err);
      }
    }

    const list = await fabric.notifications.list();
    if (!list.find(n => n.chaincodeName === Config.Privatehive.chaincodeName && n.channelName === Config.Privatehive.channelName && n.chaincodeEventName === 'chaincodeDeployed')) {
      return t.fail('Notification not in list');
    }

    // await fabric.notifications.remove({
    //   chaincodeEventName: 'chaincodeDeployed',
    //   chaincodeName: Config.Privatehive.chaincodeName,
    //   channelName: Config.Privatehive.channelName,
    // });

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});
