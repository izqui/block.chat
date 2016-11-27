import {BlockChat as BC, KeyStore as KS} from './contracts';

export const BlockChat = !Meteor.settings.deployed ? BC.deployed() : BC.at(Meteor.settings.deployed.blockchat);
export var KeyStorePromise = function() {
  return BlockChat.keyStore.call()
    .then((ks) => {
      return KS.at(ks);
    });
}()
