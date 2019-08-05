const utils = require ('sproof-utils');


class Registration {
  constructor (params) {
    let defaultState = {
      validFrom: undefined,
      validUntil: undefined,
      data: undefined,
      dependencies: [],
      receivers: []
    };

    let {dependencies, receiverAttributes,  receivers, documentType, documentHash, data, validFrom, validUntil, name, locationHash} = params;

    this.state = {
      ...defaultState,
      documentHash : data ? utils.getHash(data) : documentHash,
      validFrom,
      validUntil,
      locationHash,
      dependencies,
      name,
      documentType,
      data,
      receiverAttributes,
      receivers
    }
  }

  addReceiver (receiver) {
    //check type receiver
    //valid receiver schema
    this.state.receivers.push(receiver.getId());
  }

  getId(profile) {
    return utils.getHash(`${profile}:${this.state.documentHash}`);
  }

  removeReceiver (receiver) {
    this.state.receivers = this.state.receivers.filter(r => r !== receiver.getId());
  }

  toString(){
    return JSON.stringify(this.state);
  }

  toJSON() {
    return this.state;
  }

}

module.exports = Registration;
