const test = require('ava');
const fs = require('fs');
const path = require('path');
const Blockcluster = require('..');

test.before(t => {
  const hyperion = new Blockcluster.Hyperion({
    apiKey: 'NDhqemdYM2FTVEUweVR3QkVxWTF4c3NSdlBmUw=='
  });

  Object.assign(t.context, { hyperion, hash: '' });
});

test.serial('Upload Hyperion file', async t => {
  try {
    const { hyperion } = t.context;

    const stream = fs.createReadStream(path.join(__dirname, '..', 'README.md'));

    const hash = await hyperion.uploadFile({ fileStream: stream, locationCode: 'us-west-2' });

    t.context.hash = Object.assign(t.context, { hash });
    t.pass();
  } catch (err) {
    t.fail(err);
  }

  return true;
});

test.serial('Fetch Hyperion file', async t => {
  try {
    const { hyperion } = t.context;
    const writeStream = fs.createWriteStream(path.join(__dirname, '..', 'tmp', 'tmp-1.md'));

    const result = await hyperion.getFile({ locationCode: 'us-west-2', fileHash: 'QmdTauoFSKchJgKDSHhPtAuSTNc8MfrCqbjqSBm2E6VoEC', writeStream });

    console.log('Result fetch', result);
    t.pass();
  } catch (err) {
    t.fail(err);
  }
});

// test.serial('Delete file', async t => {
//   try {
//     const { hyperion, hash } = t.context;

//     const result = await hyperion.deleteFile({ locationCode: 'us-west-2', fileHash: hash });

//     console.log('Result delete', result);
//     t.pass();
//   } catch (err) {
//     t.fail(err);
//   }
// });
