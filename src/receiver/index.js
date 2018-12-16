const utils = require ('sproof-utils');
const sproof = require ('../sproof');

const defaultState = {
  validFrom: null,
  validUntil: null,
  attributes: []
};


class Receiver {
  constructor (data) {
    this.state = {
      ...defaultState,
      ...data,
    }

    if (this.state.attributes.length === 0 && !this.state.attributesHash){
      this.setAttributesHash();
    }
    this.getId();
  }

  getId () {
    this.state.rootValues = `${this.state.address};${this.state.attributesHash};${this.state.validFrom};${this.state.validUntil}`;
    return utils.getHash(this.state.rootValues);
  }

  setAttributesHash() {
    if (this.state.attributes.length == 0) {
      this.state.attributesHash = utils.getSalt();
      this.state.attributesValues = null
    }else {
      let ordered = this.state.attributes.sort((a, b) => a.key.localeCompare(b.key, 'en-US'));
      this.state.attributesValues = ordered.map(a => `${a.key}:${a.hash}`).join(';');
      this.state.attributesHash = utils.getHash(this.state.attributesValues);
    }
    return this.state.attributesHash;
  }

  addAttribute(key, value) {
    this._addAttribute({key, value});
  }

  _addAttribute (attribute) {
    attribute.salt = utils.getSalt();
    attribute.hash = utils.getHash({value: attribute.value, salt: attribute.salt});
    this.state.attributes.push(attribute);
    this.setAttributesHash();
    this.getId();
  }

  share (privateKey, attributesToShare = [], verifier){

    let signature = privateKey ? utils.sign(this.getId(), privateKey) : undefined;

    return {
      rootValue: this.state.rootValues,
      attributesValues: this.state.attributesValues,
      attributes : this.state.attributes.filter(a => attributesToShare.find(as => as === a.key)).map(a =>{ return {value: a.value, salt: a.salt}}),
      verifier,
      signature
    }
  }

  toString (){
   return JSON.stringify(this.state, null, '\t');
  }

  toJSON(){
    return this.state;
  }
}


Receiver.validate = (receiver, signature) => {
  let id = receiver.getId();
  let valid = false;
  let error = '';
  try{
    valid = utils.verify(id, signature, receiver.state.address);
  }catch(err){
    valid: false;
    error = err.message;
  }

  if (valid){
    return {
      valid : true,
      validUntil : receiver.state.validUntil,
      validFrom : receiver.state.validFrom,
      id,
      attributes: receiver.state.attributes
    }
  }else{
    return {
      valid: false,
      error
    }
  }
};


Receiver.restore = (sharingData) => {
  let [address, attributesHash, validFrom, validUntil, salt] = sharingData.rootValue.split(';');
  let state = {
    address,
    attributesHash,
    validFrom,
    validUntil,
    attributesValues : sharingData.attributesValues
  };
  let attributes = [];
  if (state.attributesValues){
    attributes = state.attributesValues.split(';').map(a => {let e = a.split(':'); return {key: e[0], hash: e[1]}});

  }
  state.attributes = sharingData.attributes.map(a => {
    let attributeHash = utils.getHash({value: a.value, salt: a.salt});

    let attributeKey = attributes.find(a => a.hash === attributeHash);
      if (attributeKey){
        return {...a, ...attributeKey}
      }
    });

  return new Receiver(state);
};

module.exports = Receiver;