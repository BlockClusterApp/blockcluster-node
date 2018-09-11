const test = require('ava');

const { before } = require('./helpers');

test.before(before);

test('create asset type', async t => {
  try {
    const { node } = t.context;

    await node.callAPI('assets/createAssetType', {
      assetType: 'solo',
      assetName: 'license',
      assetIssuer: '0x380525af1011d609114091e586fc04b1197471f2'
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
      fromAccount: '0x380525af1011d609114091e586fc04b1197471f2',
      toAccount: '0x380525af1011d609114091e586fc04b1197471f2',
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
