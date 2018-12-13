const request = require('request');
const helpers = require('../../helpers');

/**
 * Handles all the functions related to hyperion
 * @class Hyperion
 */
class Hyperion {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
  }

  /**
   * Uploads a file to hyperion service
   * @param  {object} options File options
   * @param {readStream} options.fileStream A read stream to the file which is to be uploaded
   * @param {string} options.locationCode Location code of the hyperion node where the file is to be uploaded
   * @return {Promise<string>} Hash of the uploaded file
   * @memberof Hyperion
   */
  uploadFile({ fileStream, locationCode }) {
    const path = '/api/hyperion/upload';

    const requestOptions = {
      url: `${helpers.getHost()}${path}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
      formData: {
        location: locationCode,
        file: {
          value: fileStream,
          options: {
            filename: `file-${new Date().getTime()}`,
            contentType: null,
          },
        },
      },
    };

    return new Promise((resolve, reject) => {
      // fileStream.pipe(
      request(requestOptions, (err, response, body) => {
        if (err) {
          return reject(err);
        }
        return resolve(JSON.parse(body).message);
      });
      // );
    });
  }

  /**
   * Downloads a file from hyperion using the hash
   * @param  {object} options File options
   * @param {string} options.locationCode Location code of the hyperion node where the file was uploaded
   * @param {string} options.fileHash Hash of the file to download
   * @param {writeStream} options.writeStream A writestream to which the downloaded file will be written
   * @return {Promise<any>} Error or response status code
   * @memberof Hyperion
   */
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
          Authorization: `Bearer ${this.apiKey}`,
        },
      };

      request(requestOptions)
        .on('error', err => reject(err))
        .on('response', response => resolve(response.statusCode))
        .pipe(writeStream);

      return true;
    });
  }

  /**
   * Deletes a file from hyperion node
   * @param  {object} options File options
   * @param  {string} locationCode Location code of the node where the file was uploaded
   * @param {string} fileHash Hash of the file to delete
   * @return {Promise<any>}
   * @memberof Hyperion
   */
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
