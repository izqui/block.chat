import web3 from './web3';

import BlockChat from '/imports/lib/protocol/build/contracts/BlockChat.sol.js';

BlockChat.setProvider(web3.currentProvider);

export {BlockChat};
