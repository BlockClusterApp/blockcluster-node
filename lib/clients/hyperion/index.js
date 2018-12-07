const request = require('request');
const helpers = require('../../helpers');

class Hyperion {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
  }

  uploadFile({ fileStream, locationCode }) {
    const path = '/api/hyperion/upload';

    const requestOptions = {
      url: `${helpers.getHost()}${path}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'multipart/form-data'
      },
      formData: {
        location: locationCode,
        file: {
          value: fileStream,
          options: {
            filename: `file-${new Date().getTime()}`,
            contentType: null
          }
        }
      }
    };

    return new Promise((resolve, reject) => {
      // fileStream.pipe(
      request(requestOptions, (err, response, body) => {
        if (err) {
          return reject(err);
        }
        resolve(JSON.parse(body).message);
      });
      // );
    });
  }

  getFile({ locationCode, fileHash, writeStream }) {
    return new Promise((resolve, reject) => {
      const path = `/api/hyperion/download?location=${locationCode}&hash=${fileHash}`;

      if (!writeStream) {
        return reject(new Error('Write stream should be defined'));
      }

      const requestOptions = {
        method: 'GET',
        url: `${helpers.getHost()}${path}`,
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      };

      request(requestOptions)
        .on('error', err => reject(err))
        .on('response', response => resolve(response.statusCode))
        .pipe(writeStream);

      return true;
    });
  }

  async deleteFile({ locationCode, fileHash }) {
    const path = `/api/hyperion/delete?location=${locationCode}&hash=${fileHash}`;

    try {
      const deleteResponse = await helpers.sendPlatformRequest({ path, method: 'DELETE', apiKey: this.apiKey });
      return deleteResponse;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Hyperion;
