const test = require('ava');

const Config = require('./helpers/config');
const Blockcluster = require('..');

test.before(t => {
  const paymeter = new Blockcluster.Paymeter({
    apiKey: Config.ApiKeys.User,
  });

  const paymeterBot = new Blockcluster.Paymeter({
    apiKey: Config.ApiKeys.Bot,
  });

  Object.assign(t.context, { paymeter, paymeterBot });
});

test('Throws an error when wallet name is missing', async t => {
  const { paymeter } = t.context;

  try {
    const walletId = await paymeter.createWallet({ walletName: `ERC Wallet ${new Date().getTime()}`, network: 'testnet', password: Config.Paymeter.password });
    if (walletId) {
      return t.fail('Wallet created');
    }

    t.fail('Wallet id is undefined. Should have gone in catch');
  } catch (err) {
    t.pass();
  }

  return true;
});

test('Creates ETH wallet', async t => {
  const { paymeterBot } = t.context;

  try {
    const walletId = await paymeterBot.createWallet({ coinType: 'ETH', walletName: `ERC Wallet ${new Date().getTime()}`, network: 'testnet', password: Config.Paymeter.password });
    if (walletId) {
      return t.pass();
    }

    t.fail('Wallet id is undefined');
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Creates ERC20 wallet', async t => {
  const { paymeterBot } = t.context;
  try {
    const walletId = await paymeterBot.createWallet({
      coinType: 'ERC20',
      walletName: `ERC20 ${new Date().getTime()}`,
      network: 'testnet',
      password: Config.Paymeter.password,
      contractAddress: '0xc25D80fF9D25802cb69b2A751394F83534011308',
      tokenSymbol: 'ERJIBIN',
    });
    if (walletId) {
      return t.pass();
    }

    t.fail('Wallet id is undefined');
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Lists all wallets', async t => {
  const { paymeter } = t.context;

  try {
    const wallets = await paymeter.getWallets();
    if (!Array.isArray(wallets)) {
      t.fail('Wallets is not an array');
      return true;
    }

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Get details of ETHWallet wallet', async t => {
  const { paymeter } = t.context;

  try {
    const wallet = await paymeter.getWallets(Config.Paymeter.ETHWallet);
    if (typeof wallet !== 'object' || Array.isArray(wallet)) {
      return t.fail('Wallet is not an object');
    }

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Get withdrawals', async t => {
  const { paymeter } = t.context;

  try {
    const withdrawals = await paymeter.getWithdrawals(Config.Paymeter.ETHWallet);
    if (!Array.isArray(withdrawals)) {
      return t.fail('Withdrawals is not an array');
    }

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Get deposits', async t => {
  const { paymeter } = t.context;

  try {
    const deposits = await paymeter.getDeposits(Config.Paymeter.ETHWallet);
    if (!Array.isArray(deposits)) {
      return t.fail('Deposits is not an array');
    }

    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Withdrawals throw errow without wallet id', async t => {
  const { paymeter } = t.context;

  try {
    const withdrawals = await paymeter.getWithdrawals();
    if (!Array.isArray(withdrawals)) {
      return t.fail('Withdrawals is not an array');
    }

    t.fail('Withdrawals should have gone to catch');
  } catch (err) {
    t.pass();
  }

  return true;
});

test('Transfer ether', async t => {
  const { paymeter } = t.context;

  try {
    // to: T7ZhRuzf7QujYmmxS
    const txnId = await paymeter.send({
      fromWalletId: Config.Paymeter.ETHWallet,
      toAddress: Config.Paymeter.toAddress,
      amount: '0.0001',
      password: Config.Paymeter.password,
    });
    if (!txnId) {
      return t.fail('Transaction id is null');
    }

    t.pass();
  } catch (err) {
    if (err.message.includes('Insufficient')) {
      return t.pass();
    }

    t.fail(err);
  }

  return true;
});

test('Transfer ERC20 with different fee wallet', async t => {
  const { paymeter } = t.context;

  try {
    // to: 8BqP56DdGCMqtJaSx
    const txnId = await paymeter.send({
      fromWalletId: Config.Paymeter.ERC20Wallet,
      toAddress: Config.Paymeter.ERCtoAddress,
      amount: '0.0001',
      password: Config.Paymeter.password,
      feeWalletId: Config.Paymeter.ETHWallet,
      feeWalletPassword: Config.Paymeter.password,
    });
    if (!txnId) {
      return t.fail('Transaction id is null');
    }

    t.pass();
  } catch (err) {
    if (err.message.includes('Insufficient Tokens') || err.message.includes('Insufficient Ether for Fees')) {
      return t.pass();
    }

    if (err.message.includes("Error: Returned values aren't valid, did it run Out of Gas?")) {
      return t.pass();
    }

    t.fail(err);
  }

  return true;
});
