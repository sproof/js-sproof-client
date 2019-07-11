var expect    = require('chai').expect;
const Receiver = require('../src/receiver');


var account = {
  mnemonic: 'a b c d e f g h i j k l1',
  address: "0x7f3eabdeca6f6410907bf8adf2c4a3ddddefaf54",
  privateKey: '0x21534e62b8fe4daf4c0ddf28f1c941adcb01ed04b723ecdb67925456c690d2a5',
  publicKey: '0x7af08ec04de44c0f8fa9da8f8577229527903c15ae48c9df5f8a175b134e9c8c63b69e226f6c02dbf3d501e2cedd31e30ffc6e73833c2b1e11df03611ef2d344'
}

describe('receiver', () => {
  it('Create receiver', () => {
    let receiver = new Receiver({address : account.address, validUntil: Math.round(new Date().getTime()/1000) });
    receiver.addAttribute('name','Max Mustermann');
    receiver.addAttribute('dateOfBirth', '01011990');
    receiver.addAttribute('placeOfBirth', 'Salzburg');
    receiver.addAttribute('a', 'b');

    let id = receiver.getId();

    let r  = (receiver.share(account.privateKey, ['a', 'name'], {id: '0x1234', blockHash: '0x34234234'}));
    let validationResult = Receiver.validate(Receiver.restore(r), r.signature);

    let restoredReceiver = Receiver.restore(r);

    expect(id).to.equal(restoredReceiver.getId());

    expect(validationResult.valid).to.be.true
  });

  it('Create receiver with no attributes', () => {
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
