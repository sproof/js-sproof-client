const axios = require('axios');
const io = require('socket.io-client');
const utils = require('sproof-utils');

const FormData = require('form-data');

class API {
  constructor(config = {}){
    this.config = config;
    this.io = null;
    this.versionpath = 'api/v1/'

  }

  createCredentials (credentials) {
    let signature;

    if (credentials.address)
      signature = utils.sign(credentials.address, credentials.privateKey);

    return {
      address: credentials.address,
      signature
    }
  }

  on (event, fun) {
    let webSocketUri = this.config.socket || this.config.uri;
    if (!this.io) this.io = io(webSocketUri);
    this.io.on(event, fun);
  }

  post(url, data, callback, formdata) {
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    let credentials = this.createCredentials(this.config.credentials);
      axios.post(url, {...data, credentials}).then(res => {
        if (res.data.error) {
          return callback(res.data.error);
        }
        return callback(null, res.data.result);
      }).catch(err => {
        callback(this.createError(err))
      });
  }

  uploadFile(buf, callback){
    let url = 'storage/upload';
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    let credentials = this.createCredentials(this.config.credentials);

    const formData = new FormData();
    formData.append('file', buf, {filename: 'file'});
    // this.sendFormData('storage/upload', formData, callback, true);
    axios({
      method: 'post',
      url,
      data: {file: formData, credentials},
      config: { headers: {'Content-Type': 'multipart/form-data' }}
    })
      .then((res) => {
        if (res.data.error) {
          return callback(res.data.error);
        }
        return callback(null, res.data.result);
      })
      .catch((err) => {
        callback(this.createError(err))
      });
  }



  get(url, params, callback) {
    url = this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;
    url = `${url}${params.id ? `/${params.id}/` : '' }`;
    delete params.id;

    let auth = this.createCredentials(this.config.credentials);
    params = {...params}

    let lst = Object.keys(params).map(k => `${k}=${params[k]}`);

    if (lst.length !== 0)
      url = url + '?' + lst.join('&');
      axios.get(url, { headers: { auth: JSON.stringify(auth) }, ...params }).then(res => {
      if (res.data.error) {
        return callback(res.data.error);
      }
      callback(null, res.data.result);
    }).catch(err => {
        callback(this.createError(err))
    })
  }

  createError (err) {
    let message = err.message;
    var status = 0;
    if (err.message !== 'Network Error'){
      status = err.response ? err.response.status : 501;
    }else
     status = 901 //check network error code
    return {status, message};
  }

  registerPremiumUser(data, callback) {
    this.post('user/register', data, callback);
  }

  getHash (data, callback) {
    this.post('storage/hash', {data}, callback);
  }

  getStatus(callback) {
    this.get('storage/status', callback);
  }

  getRawTransaction (events, callback) {
    this.post('storage/transaction', {events, address: this.config.credentials.address }, callback);
  }

  submit (events, signedTx, transactionHash, callback) {
    this.post('storage/submit', {events, signedTx, transactionHash}, callback);
  }

  submitPremium(events, from,  hash, signature, callback) {
    this.post('storage/premium/submit', {events, hash, from, signature}, callback);
  }
}

module.exports = API;