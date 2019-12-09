const axios = require('axios');
const io = require('socket.io-client');
const utils = require('sproof-utils');
const createCredentials  = require ('../credentials/createCredentials')
const FormData = require('form-data');

class API {
  constructor(config = {}){
    this.config = config;
    this.io = null;
    this.versionpath = 'api/v1/';
    this.credentials;
  }

  //
  // on (event, fun) {
  //   let webSocketUri = this.config.socket || this.config.uri;
  //   if (!this.io) this.io = io(webSocketUri);
  //   this.io.on(event, fun);
  // }

  setSessionCredentials(email, sessionToken) {
    this.credentials = {
      ...this.credentials,
      sessionToken,
      email
    };
  }

  post(url, data, callback) {
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    url = `${url}?chainId=${this.config.chainId}`


    let credentials = this.credentials || createCredentials(this.config.credentials);

    axios.post(url, {...data, credentials : credentials }).then(res => {
      if (res.data.error) {
        return callback({message: res.data.error, status: res.status});
      }
      return callback(null, res.data.result);
    }).catch(err => {
      callback(this.createError(err))
    });
  }


  getInvoiceLink(orderId){
    let uri = this.config.uri;
    let url = this.versionpath + 'order/invoice';
    url = uri ? `${uri}${url}` : url;
    url = url + `?orderId=${orderId}&sessionToken=${this.credentials.sessionToken}&email=${this.credentials.email}`

    return url
  }

  getOrderConfirmationLink(orderId){
    let uri = this.config.uri;
    let url = this.versionpath + 'order/confirmation';
    url = uri ? `${uri}${url}` : url;
    url = url + `?orderId=${orderId}&sessionToken=${this.credentials.sessionToken}&email=${this.credentials.email}`

    return url
  }


  get(url, params, callback) {

    let uri = this.config.uri;

    url = this.versionpath + url;
    url = uri ? `${uri}${url}` : url;
    url = `${url}${params.id ? `/${params.id}/` : '' }`;
    delete params.id;

    let auth = this.credentials || createCredentials(this.config.credentials);


    params.chainId = this.config.chainId

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

  delete(url, id, callback) {
    url =  this.versionpath + url;
    url = this.config.uri ? `${this.config.uri}${url}` : url;

    let auth = this.credentials || createCredentials(this.config.credentials);


    if (id) url = url+`/${id}`;


    url = `${url}?chainId=${this.config.chainId}`

    axios.delete(url, { headers: {auth: JSON.stringify(auth) }}).then(res => {
      if (res.data.error) {
        return callback({message: res.data.error, status: res.status});
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

    let credentials = this.credentials || createCredentials(this.config.credentials);


    const formData = new FormData();

    formData.append('file', buf, {filename: 'file'});
    let fd = buf.name ? formData : { file: formData };

    url = `${url}?chainId=${this.config.chainId}`


    axios({
      method: 'post',
      url,
      data: fd,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      config: { headers: {'Content-Type': 'multipart/form-data', auth: JSON.stringify(credentials) }}
    })
      .then((res) => {
        if (res.data.error) {
          return callback({message: res.data.error, status: res.status});
        }
        return callback(null, res.data.result);
      })
      .catch((err) => {
        callback(this.createError(err))
      });
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


  updateUiSettings(setting, callback){
    this.post('user/uisettings', { setting }, callback);
  }

  setPlanSubscription(value, callback){
    this.post('user/plan/subscription', { value }, callback);
  }

  signUp(data, callback){
    let {email, password, username, domain, passphrase, partnerId} = data;

    let hashedPassword = utils.getHash(password);
    let encryptedCredentials = utils.createEncryptedCredentials(passphrase);


    this.post('user/signup', {
      email,
      hashedPassword,
      encryptedCredentials,
      username,
      partnerId,
      domain
    }, callback);
  }

  getPartnerStyle(id, callback){
    this.get('partner/style/'+id, {}, callback)
  }

  signUpFinal(data, verificationToken, callback){
    this.post('user/signup/final', {
      verificationToken,
      ...data
    }, callback)
  }

  getSignUpData(verificationToken, callback){

    this.post('user/signup/data', {
     verificationToken
    }, callback);
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
    this.post('user/event', {event}, callback);
  }

  updateChain(chainId, callback) {
    this.post('user/chain', {chainId}, callback);
  }

  deleteEvent(hash, callback) {
    this.delete('user/event', hash, callback);
  }

  validUsername(username, callback) {
    this.get('user/username', {username}, callback);
  }

  getUser(callback) {
    this.get('user', {}, callback);
  }


  createKey(passphrase, callback) {
    let ec = utils.createEncryptedCredentials(passphrase);
    this.post('user/key', {...ec}, callback);
  }

  setExistingMnemonic(mnemonic, passphrase, callback) {
    let ec = utils.getEncryptedCredentials(mnemonic, passphrase);
    this.post('user/key', {...ec}, callback);
  }

  setExistingPublicKey(data, callback){
    this.post('user/key', {...data}, callback);
  }


  deleteKey (callback){
    this.delete('user/key', null, callback);
  }

  updateEncryptedMnemonic (encryptedMnemonic, callback){
    this.post('user/key', {encryptedMnemonic}, callback);
  }

  confirmPayment(data, callback) {
    this.post('payment/confirm', {...data}, callback);
  }

  confirmPaymentSignUp(data, callback) {
    this.post('payment/signup/confirm', {...data}, callback);
  }

  getPlans(callback) {
    this.get('plan', {}, callback);
  }

  updateBillingAddress(billingAddress, callback) {
    this.post('user/billingAddress', {billingAddress}, callback);
  }

  addOrder(type, data, callback){
    this.post('order', {orderType: type, data}, callback);
  }

  getOrders(params,callback){
    this.get('order', params, callback);
  }

  getCustomers(params, callback){
    this.get('partner/customer', params, callback);
  }

  addPartnerOrder (data, callback){
    this.post('partner/customer/order', data, callback);
  }

}

module.exports = API;
