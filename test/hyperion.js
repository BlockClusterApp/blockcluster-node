const test = require('ava');
const fs = require('fs');
const path = require('path');

const Config = require('./helpers/config');
const Blockcluster = require('..');

test.before(t => {
  const hyperion = new Blockcluster.Hyperion({
    apiKey: Config.ApiKeys.User,
  });

  Object.assign(t.context, { hyperion, hash: '' });
});

test('Upload and Delete Hyperion file', async t => {
  try {
    const { hyperion } = t.context;

    const stream = fs.createReadStream(path.join(__dirname, '..', 'README.md'));

    const hash = await hyperion.uploadFile({ fileStream: stream, locationCode: Config.Hyperion.locationCode });

    await hyperion.deleteFile({ locationCode: Config.Hyperion.locationCode, fileHash: hash });
    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test('Fetch Hyperion file', async t => {
  try {
    const { hyperion } = t.context;
    const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'tmp', 'tmp-1.md'));

    await hyperion.getFile({ locationCode: Config.Hyperion.locationCode, fileHash: Config.fileHash, writeStream });

    t.pass();
  } catch (err) {
    t.fail(err);
  }
});
