const test = require('ava');

const Wallet = require('ethereumjs-wallet');

const { before } = require('./helpers');

test.before(before);

test('create asset type', async t => {
  try {
    const { node } = t.context;

    await node.callAPI('assets/createAssetType', {
      assetType: 'solo',
      assetName: 'license',
      fromAccount: node.getWeb3().eth.accounts[0],
    });

    t.pass();
  } catch (error) {
    console.log(error);
    t.fail();
  }
});

test('issue asset', async t => {
  try {
    const { node } = t.context;
    await node.callAPI('assets/issueSoloAsset', {
      assetName: 'license',
      fromAccount: node.getWeb3().eth.accounts[0],
      toAccount: node.getWeb3().eth.accounts[0],
      identifier: '1234',
    });

    t.pass();
  } catch (error) {
    t.fail();
  }
});

test('get solo asset', async t => {
  try {
    const { node } = t.context;
    const assetInfo = await node.callAPI('assets/getSoloAssetInfo', {
      assetName: 'license',
      identifier: '1234',
    });

    t.is(assetInfo.status, 'open');
    t.pass();
  } catch (error) {
    t.fail();
  }
});

test('create stream', async t => {
  try {
    const { node } = t.context;

    const wallet = Wallet.generate();
    const privateKey = wallet.getPrivateKey().toString('hex');
    const address = `0x${wallet.getAddress().toString('hex')}`;

    await node.callAPI(
      'streams/create',
      {
        streamName: 'renew',
        fromAccount: address,
      },
      {
        privateKey,
      }
    );

    t.pass();
  } catch (error) {
    console.log(error);
    t.fail();
  }
});
