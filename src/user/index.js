const axios = require('axios');
const io = require('socket.io-client');
const utils = require('sproof-utils');

const FormData = require('form-data');

class API {
  constructor(config = {}){
    this.config = config;
    this.io = null;
    this.versionpath = 'api/v1/';
    this.sessionToken = null;
    this.email = null;
  }

  //
  // on (event, fun) {
  //   let webSocketUri = this.config.socket || this.config.uri;
  //   if (!this.io) this.io = io(webSocketUri);
  //   this.io.on(event, fun);
  // }

  setSessionCredentials(email, sessionToken) {
    this.sessionToken = sessionToken;
    this.email = email;
  }

  post(url, data, callback) {
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    //let credentials = this.createCredentials(this.config.credentials);
    axios.post(url, {...data }).then(res => {
      if (res.data.error) {
        return callback({message: res.data.error, status: res.status});
      }
      return callback(null, res.data.result);
    }).catch(err => {
      callback(this.createError(err))
    });
  }

  delete(url, data, callback) {
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    //let credentials = this.createCredentials(this.config.credentials);
    axios.delete(url, {...data }).then(res => {
      if (res.data.error) {
        return callback({message: res.data.error, status: res.status});
      }
      return callback(null, res.data.result);
    }).catch(err => {
      callback(this.createError(err))
    });
  }


  get(url, params, callback) {

    let uri = this.config.uri;

    if (url === 'verification' && this.config.verificationUri) uri = this.config.verificationUri;

    url = this.versionpath + url;
    url = uri ? `${uri}${url}` : url;
    url = `${url}${params.id ? `/${params.id}/` : '' }`;
    delete params.id;

    let auth = this.createCredentials(this.config.credentials);
    params = {...params};

    let lst = Object.keys(params).map(k => `${k}=${params[k]}`);

    if (lst.length !== 0)
      url = url + '?' + lst.join('&');
    axios.get(url, { headers: { auth: JSON.stringify(auth) }, ...params }).then(res => {
      if (res.data.error) {
        return callback({message: res.data.error, status: res.status});
      }
      return callback(null, res.data.result);
    }).catch(err => {
      callback(this.createError(err))
    })
  }

  createError (err) {
    let status, message;

    if (err.response && err.response.data){
      message = err.response.data.error;
      status = err.response.status;
    }else {
      status = err.code;
      message = err.message;
    }

    status = status || 500;
    message = message || err.toString();

    return {status, message};
  }

  register(data, callback) {
    let {email} = data;

    this.post('user/register', {email}, callback);
  }

  setPassword(data, callback) {
    let {password, verificationToken} = data;

    let hashedPassword = utils.getHash(password);

    this.post('user/password/set', {hashedPassword, verificationToken}, callback);
  }

  resetPassword(data, callback) {
    let { email } = data;

    this.post('user/password/reset', { email }, callback);
  }

  signIn(data, callback) {
    let {password, email} = data;
    let hashedPassword = utils.getHash(password);

    this.post('user/signin', {hashedPassword, email}, callback);
  }

  signOut(data, callback) {
    let {sessionToken, email} = data;

    this.post('user/signout', {sessionToken, email}, callback);
  }

  addEvent(event, callback) {
    this.post('user/event', event, callback);
  }

  deleteEvent(event, callback) {
    this.delete('user/event', event, callback);
  }

  getUser(callback) {

  }



  // getHashForEvents (data, callback) {
  //   this.post('storage/hash', {data}, callback);
  // }
  //
  // getStatus(callback) {
  //   this.get('storage/status', callback);
  // }
  //
  // getRawTransaction (eventContainer, callback) {
  //   this.post('storage/transaction', {eventContainer, address: this.config.credentials.address }, callback);
  // }
  //
  // submit (eventContainer, signedTx, transactionHash, callback) {
  //   this.post('storage/submit', {eventContainer, signedTx, transactionHash}, callback);
  // }
  //
  // submitPremium(eventContainer, from,  hash, dhtHash, signature, callback) {
  //   this.post('storage/premium/submit', {eventContainer, hash, dhtHash, from, signature}, callback);
  // }
}

module.exports = API;