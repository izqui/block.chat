import web3 from './web3';

import BlockChat from '/imports/lib/protocol/build/contracts/BlockChat.sol.js';
import KeyStore from '/imports/lib/protocol/build/contracts/KeyStore.sol.js';
import MessageStore from '/imports/lib/protocol/build/contracts/MessageStore.sol.js';

BlockChat.setProvider(web3.currentProvider);
KeyStore.setProvider(web3.currentProvider);
MessageStore.setProvider(web3.currentProvider)

export {BlockChat, KeyStore, MessageStore};
