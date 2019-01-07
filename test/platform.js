const test = require('ava');
const Blockcluster = require('..');

test.before(t => {
  const platform = new Blockcluster.Platform({
    apiKey: 'RUxTOU1TcGNuRnJuRVp3elR5NVkjMCVE',
  });

  Object.assign(t.context, { platform });
});

test('Fetch Network Configs', async t => {
  try {
    const { platform } = t.context;
    const configs = await platform.fetchNetworkTypes();

    if (!Array.isArray(configs)) {
      return t.fail('Network configs is not an array');
    }

    const config = configs[0];
    if (!config) {
      return t.fail('No network configs');
    }

    const requiredKeys = ['_id', 'name', 'cpu', 'ram', 'disk', 'isDiskChangeable', 'cost'];
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
    const configs = await platform.fetchLocations();

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

test('Create and Delete Network', async t => {
  try {
    const { platform } = t.context;
    const res = await platform.createNetwork({
      networkName: `Jibin ${new Date().getTime()}`,
      networkConfigId: 'ZJPNEbBRMiXdRgDuJ',
      locationCode: 'us-west-2',
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

test('Send Invite', async t => {
  try {
    const { platform } = t.context;
    const res = await platform.inviteViaEmail({
      inviteToEmail: 'jibin.mathews@blockcluster.io',
      networkId: 'hpizmsaw',
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
