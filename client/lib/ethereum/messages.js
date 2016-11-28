import {BlockChat, MessageStorePromise} from './deployed';
import {Conversations, keyManager as keys} from './keys';

MessageCollection = new Mongo.Collection('bc_messages', {connection: null});

class MessagesManager {
  constructor(address) {
    this.address = address;
    MessageStorePromise.then((ms) => this.messageStore = ms);

    this.reloadMessageFilter();
  }

  sendMessage(recipient, payload) {
    var address;
    keys.getAddressForRecipient(recipient)
      .then((a) => {
        address = a;
        return keys.encryptPayload(address, payload)
      })
      .then((encrypted) => {
        const timestamp = Math.floor(+new Date()/1000);
        const hash = this.recipientHash(timestamp, address);

        return BlockChat.sendMessage(encrypted, timestamp, hash, {from: this.address, gas: 1000000});
      })
  }

  reloadMessageFilter(addedConversation) {
    if (this.messagesFilter)
      this.messagesFilter.stopWatching();

    // var conversations = Conversations.find().fetch().map(c => { return c.address; });
    // Is it performant without filtering to only known conversations?
    this.messagesFilter = BlockChat.NewMessage({}, {fromBlock: this.lastWatchedBlock, toBlock: 'latest'});
    this.listenForMessages();
    this.fetchPastMessages();
  }

  listenForMessages() {
    this.messagesFilter.watch((err, ev) => {
      if (err)
        return console.log('ERROR', err);
      this.processEvent(ev);
      lastWatchedBlock = ev.blockNumber;
    });
  }

  fetchPastMessages() {
    this.messagesFilter.get((err, ev) => this.processEvent(ev));
  }

  processEvent(ev) {
    if (ev && ev.args && this.recipientHash(ev.args.timestamp, this.address) == ev.args.recipientHash) {
      this.getMessage(ev.args.messageID);
    }
  }

  getMessage(messageID, hash) {
    this.messageStore.getMessage(messageID)
      .then(([sender, payload, timestamp, _hash]) => {
        if (hash != hash)
          throw new Error("Unexpected message hash");

        var promisedMessage = {sender: sender, payload: keys.decryptPayload(payload, this.address), timestamp: timestamp}
        return Promise.allProperties(promisedMessage);
      })
      .then((message) => {
        console.log('received message', message);
      })
  }

  get lastBlockKey() {
    return `lB_${this.address}`;
  }

  get lastWatchedBlock() {
    return Session.get(this.lastBlockKey) || EthBlocks.latest.number;
  }

  set lastWatchedBlock(block) {
    return Session.setPersistent(this.lastBlockKey, block);
  }

  recipientHash(timestamp, recipient) {
    return '0x'+CryptoJS.SHA256(timestamp+recipient).toString();
  }
}

export const Messages = MessageCollection;
export const MessageManager = MessagesManager;
