import web3 from './web3';
import {keyManager as keys} from './keys';
import {MessageManager} from './messages';

if(location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')
    Meteor.disconnect();

this.M = new MessageManager(Session.get('selectedAddress'));

connectToNode = function(){
    console.time('startNode')
    console.log('Connect to node...');

    EthAccounts.init();
    EthBlocks.init();

    if (!Session.get('selectedAddress'))
      Session.setPersistent('selectedAddress', Random.choice(EthAccounts.find().fetch()).address)

    var selectedAddress = Session.get('selectedAddress');
    var username = FlowRouter.getQueryParam('username');

    keys.checkPublicKeyForAddress(selectedAddress)
      .then((isKeyRegistered) => {
        if (isKeyRegistered) {
          console.log('already got keys', selectedAddress)

        } else {
          console.log('generating keys for', selectedAddress, username)
          keys.generateKeyPair(username, selectedAddress)
            .then(() => console.log('keypair generated'));
        }
      });

    console.timeEnd('startNode');
};

// Stop app operation, when the node is syncing
web3.eth.isSyncing(function(error, syncing) {
  if(!error) {
    if(syncing === true) {
      console.time('nodeRestarted')
      console.log('Node started syncing, stopping app operation');
      web3.reset(true);

    } else if(_.isObject(syncing)) {
      syncing.progress = Math.floor(((syncing.currentBlock - syncing.startingBlock) / (syncing.highestBlock - syncing.startingBlock)) * 100);
      syncing.blockDiff = numeral(syncing.highestBlock - syncing.currentBlock).format('0,0');

      TemplateVar.setTo('header nav', 'syncing', syncing);

    } else {
      console.timeEnd('nodeRestarted')
      console.log('Restart app operation again');

      TemplateVar.setTo('header nav', 'syncing', false);
      connectToNode();
    }
  }
});


var connect = function(){
  if(web3.isConnected()) {
    // only start app operation, when the node is not syncing (or the eth_syncing property doesn't exists)
    web3.eth.getSyncing(function(e, sync) {
        if(e || !sync)
            connectToNode();
    });

  } else {
    // make sure the modal is rendered after all routes are executed
    Meteor.setTimeout(function(){
        // if in mist, tell to start geth, otherwise start with RPC
        var gethRPC = (web3.admin) ? 'geth' : 'geth --rpc --rpccorsdomain "'+window.location.protocol + '//' + window.location.host+'"';

        EthElements.Modal.question({
            text: new Spacebars.SafeString(TAPi18n.__('wallet.app.texts.connectionError' + (web3.admin ? 'Mist' : 'Browser'),
                {node: gethRPC})),
            ok: function(){
                Tracker.afterFlush(function(){
                    connect();
                });
            }
        }, {
            closeable: false
        });

    }, 600);
  }
}

Meteor.startup(function(){
  Meteor.setTimeout(function() {
    connect();
  }, 3000);
});
