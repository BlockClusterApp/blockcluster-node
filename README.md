# blockcluster

[![build status](https://img.shields.io/travis/BlockClusterApp/blockcluster-node.svg)](https://travis-ci.org/BlockClusterApp/blockcluster-node)
[![code coverage](https://img.shields.io/codecov/c/github/BlockClusterApp/blockcluster-node.svg)](https://codecov.io/gh/BlockClusterApp/blockcluster-node)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/BlockClusterApp/blockcluster-node.svg)](LICENSE)

> Official BlockCluster Node.js SDK for Dynamo and Platform APIs


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Docs](#docs)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install blockcluster
```

[yarn][]:

```sh
yarn add blockcluster
```


## Usage

Here is an example script showing how to create an asset type, issue assets and fetch assets:

```js
const Blockcluster = require('blockcluster');

const node = new Blockcluster.Dynamo({
    locationDomain: 'app-ap-south-1b.blockcluster.io', //enter your node's location domain
    instanceId: 'noeurgyb' //enter your instanceId
});

//create license solo asset type
await node.callAPI('assets/createAssetType', {
    assetType: 'solo',
    assetName: 'license',
    fromAccount: node.getWeb3().eth.accounts[0]
});

//issue a license
await node.callAPI('assets/issueSoloAsset', {
    assetName: 'license',
    fromAccount: node.getWeb3().eth.accounts[0],
    toAccount: node.getWeb3().eth.accounts[0],
    identifier: '1234'
});

//get asset info
const assetInfo = await node.callAPI('assets/getSoloAssetInfo', {
    assetName: 'license',
    identifier: '1234'
});
```

Here is an another example script showing how to create stream using  an offline account:

```js
const Wallet = require('ethereumjs-wallet');

const wallet = Wallet.generate();
const privateKey = wallet.getPrivateKey().toString('hex');
const address = '0x' + wallet.getAddress().toString('hex');

await node.callAPI(
    'streams/create',
    {
        streamName: 'renew',
        fromAccount: address
    },
    {
        privateKey
    }
);
```


## Docs

Documentation of Dynamo's REST APIs and their usage is available at <https://node.api.blockcluster.io>


## Contributors

| Name               | Website                                |
| ------------------ | -------------------------------------- |
| **BlockCluster**   | <https://www.blockcluster.io>          |
| **Jibin Mathews**  | <https://www.jibinmathews.in>          |
| **Narayan Prusty** | <https://www.github.com/narayanprusty> |


## License

[MIT](LICENSE) © [BlockCluster](https://www.blockcluster.io)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/
