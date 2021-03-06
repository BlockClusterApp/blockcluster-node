const request = require('request');
const helpers = require('../../helpers');

/**
 * @classdesc Handles all the functions related to hyperion
 * @param  {object} options Options
 * @param {string} options.apiKey API Key for authentication
 * @param {string} options.[domain] Domain where the platform is hosted
 * @class Hyperion
 */
class Hyperion {
  constructor({ apiKey, domain }) {
    this.apiKey = apiKey;
    this.domain = domain || helpers.getHost();
  }

  /**
   * Uploads a file to hyperion service
   * @param  {object} options File options
   * @param {readStream} options.fileStream A read stream to the file which is to be uploaded
   * @param {string} options.locationCode Location code of the hyperion node where the file is to be uploaded
   * @example <caption>Uploads a file to hyperion</caption>
   * const fileReadStream = fs.createReadStream('file_to_read.txt');
   * const fileHash = await hyperion.uploadFile({fileStream: fileReadStream, locationCode: 'us-west-2'});
   * console.log(fileHash);
   * // Prints the hash of the file in the hyperion cloud
   * @returns {Promise<string>} Hash of the uploaded file
   * @memberof Hyperion
   * @instance
   */
  uploadFile({ fileStream, locationCode }) {
    const path = '/api/hyperion/upload';

    const requestOptions = {
      url: `${this.domain}${path}`,
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
            filename: `file-${new Date().getTime()}-a`,
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

        const res = JSON.parse(body);
        if (res.error) {
          return reject(res.error);
        }

        return resolve(res.message);
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
   * @example <caption>Downloads a file from hyperion service</caption>
   * const writeStream = fs.createWriteStream('download-path.txt');
   * const res = await hyperion.getFile({locationCode: 'us-west-2', fileHash: 'ajshdvi23y4ioiertuykesd', writeStream });
   * @returns {Promise<any>} Error or response status code
   * @memberof Hyperion
   * @instance
   */
  getFile({ locationCode, fileHash, writeStream }) {
    return new Promise((resolve, reject) => {
      const path = `/api/hyperion/download?location=${locationCode}&hash=${fileHash}`;

      if (!writeStream) {
        return reject(new Error('Write stream should be defined'));
      }

      const requestOptions = {
        method: 'GET',
        url: `${this.domain}${path}`,
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
   * @example <caption>Deletes a file from hyperion service</caption>
   * const res = await hyperion.deleteFile({locationCode: 'us-west-2', fileHash: 'wefjhggbhoirekuyghiqwlyug'})
   * @returns {Promise<any>} Response of delete operation or error
   * @memberof Hyperion
   * @instance
   */
  async deleteFile({ locationCode, fileHash }) {
    const path = `/api/hyperion/delete?location=${locationCode}&hash=${fileHash}`;

    try {
      const deleteResponse = await helpers.sendPlatformRequest({ domain: this.domain, path, method: 'DELETE', apiKey: this.apiKey });
      return deleteResponse;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = Hyperion;
