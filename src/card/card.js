const Registration = require ('../registration');


const exampleCard = {
  data: {
    title: "Example Membership Card",
    subtitle: '',
    image: '',
    receiver: {
      attributes: ['name', 'dateOfBirth', 'image', 'email', 'address', 'code'].map(a => {return {key: a}})
    },
  },
  validFrom: Math.round(new Date().getTime()/1000),
  validUntil: undefined
};



class Card extends Registration{
  constructor (data, validFrom, validUntil) {
    super({data, validFrom, validUntil});
  }

  addReceiver(receiver){
    let attributeList = this.state.data.attributes;
    attributeList.map(aName => {
      let found = receiver.state.attributes.find(a => a.key === aName);
      if (!found) throw new Error(`Invalid receiver, attribute ${aName} not defined.`);
    })
    super.addReceiver(receiver);
  }
}

module.exports = Card;