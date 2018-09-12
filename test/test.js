const test = require('ava');

const { before } = require('./helpers');

test.before(before);

test('create asset type', async t => {
  try {
    const { node } = t.context;

    await node.callAPI('assets/createAssetType', {
      assetType: 'solo',
      assetName: 'license',
      assetIssuer: node.getWeb3().eth.accounts[0]
    });

    t.pass();
  } catch (error) {
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
      identifier: '1234'
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
      identifier: '1234'
    });

    t.is(assetInfo.status, 'open');
    t.pass();
  } catch (error) {
    t.fail();
  }
});
