const test = require('ava');
const fs = require('fs');
const path = require('path');
const Blockcluster = require('..');

test.before(t => {
  const hyperion = new Blockcluster.Hyperion({
    apiKey: 'JSRFZ09mN1FXQ2Y0TnEzS3VhSWc5TCVkQWNn',
  });

  Object.assign(t.context, { hyperion, hash: '' });
});

test('Upload and Delete Hyperion file', async t => {
  try {
    const { hyperion } = t.context;

    const stream = fs.createReadStream(path.join(__dirname, '..', 'README.md'));

    const hash = await hyperion.uploadFile({ fileStream: stream, locationCode: 'us-west-2' });

    await hyperion.deleteFile({ locationCode: 'us-west-2', fileHash: hash });
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

    await hyperion.getFile({ locationCode: 'us-west-2', fileHash: 'QmdTauoFSKchJgKDSHhPtAuSTNc8MfrCqbjqSBm2E6VoEC', writeStream });

    t.pass();
  } catch (err) {
    t.fail(err);
  }
});
