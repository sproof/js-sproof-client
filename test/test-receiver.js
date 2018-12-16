var expect    = require('chai').expect;
const Receiver = require('../src/receiver');
const utils = require ('sproof-utils');

const account = {
  address: "a03cb2e3ec12dfaf8688b876a4143225a0c64d15",
  privateKey : 'c63f0cf10933d15b5f24a22e247ee8639dae7502655cc032edc9279a2f602fb4',
  publicKey : '2ab25035b3d357215c7d7656c9f3fa2d37a25e26dd0c75169dadb5b9292dfed3004b3094c8b4a5ba56e4550d77fabc1cc6d678b38e2ab33dfae96daaae3d0c8e'
};

describe('receiver', () => {
  describe('Create receiver', () => {
    let receiver = new Receiver({address : account.address, validUntil: Math.round(new Date().getTime()/1000) });
    receiver.addAttribute('name','Clemens Brunner');
    receiver.addAttribute('dateOfBirth', '30051992');
    receiver.addAttribute('placeOfBirth', 'Wels');
    receiver.addAttribute('a', 'b');

    let id = receiver.getId();

    let r  = (receiver.share(account.privateKey, ['a', 'name'], {id: '0x1234', blockHash: '0x34234234'}));
    let validationResult = Receiver.validate(Receiver.restore(r), r.signature);

    let restoredReceiver = Receiver.restore(r);

    expect(id).to.equal(restoredReceiver.getId());
    expect(validationResult.valid).to.be.true
  });

  describe('Create receiver with no attributes', () => {
    let receiver = new Receiver({address : account.address, validUntil: Math.round(new Date().getTime()/1000) });

    let id = receiver.getId();

    let r  = (receiver.share(account.privateKey, []));
    let restoredReceiver = Receiver.restore(r);
    let validationResult = Receiver.validate(restoredReceiver, r.signature);

    expect(restoredReceiver.state.attributesHash).not.to.be.undefined;
    expect(id).to.equal(restoredReceiver.getId());
    expect(validationResult.valid).to.be.true;

  });
});
