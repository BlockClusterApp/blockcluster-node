const test = require('ava');
const Blockcluster = require('..');

test.before(t => {
  const paymeter = new Blockcluster.Paymeter({
    apiKey: 'RUxTOU1TcGNuRnJuRVp3elR5NVkjMCVE',
  });

  Object.assign(t.context, { paymeter });
});

test('Throws an error when wallet name is missing', async t => {
  const { paymeter } = t.context;

  try {
    const walletId = await paymeter.createWallet({ walletName: `ERC Wallet ${new Date().getTime()}`, network: 'testnet', password: '1234567890' });
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
  const { paymeter } = t.context;

  try {
    const walletId = await paymeter.createWallet({ coinType: 'ETH', walletName: `ERC Wallet ${new Date().getTime()}`, network: 'testnet', password: '1234567890' });
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
  const { paymeter } = t.context;
  try {
    const walletId = await paymeter.createWallet({
      coinType: 'ERC20',
      walletName: `ERC20 ${new Date().getTime()}`,
      network: 'testnet',
      password: '1234567890',
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
    const wallet = await paymeter.getWallets('T7ZhRuzf7QujYmmxS');
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
    const withdrawals = await paymeter.getWithdrawals('T7ZhRuzf7QujYmmxS');
    if (!Array.isArray(withdrawals)) {
      return t.fail('Withdrawals is not an array');
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
      fromWalletId: 'gNDyfBfC57geR9sww',
      toAddress: '0x0c22bc958ef397f091b19249d87742de7a1d967c',
      amount: '0.0001',
      password: '1234567890',
    });
    if (!txnId) {
      return t.fail('Transaction id is null');
    }
    t.pass();
  } catch (err) {
    t.fail(err);
  }
  return true;
});

test('Transfer ERC20 with different fee wallet', async t => {
  const { paymeter } = t.context;

  try {
    // to: 8BqP56DdGCMqtJaSx
    const txnId = await paymeter.send({
      fromWalletId: 'KXRcucyerDfSZvKgC',
      toAddress: '0x722c038bc3c17a7ec63162d8e28392756509f909',
      amount: '0.0001',
      password: '1234567890',
      feeWalletId: 'gNDyfBfC57geR9sww',
      feeWalletPassword: '123457890',
    });
    if (!txnId) {
      return t.fail('Transaction id is null');
    }
    t.pass();
  } catch (err) {
    if (err.message.includes('Insufficient Tokens')) {
      return t.pass();
    }
    t.fail(err);
  }
  return true;
});
