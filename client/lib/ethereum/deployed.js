import {BlockChat as BC, KeyStore, MessageStore} from './contracts';

export const BlockChat = !Meteor.settings.deployed ? BC.deployed() : BC.at(Meteor.settings.deployed.blockchat);
export var KeyStorePromise = function() {
  return BlockChat.keyStore.call()
    .then((ks) => {
      return KeyStore.at(ks);
    });
}()

export var MessageStorePromise = function() {
  return BlockChat.messageStore.call()
    .then((ms) => {
      return MessageStore.at(ms);
    });
}()
