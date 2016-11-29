import {Conversations, Messages, MessageManager} from '/client/lib/ethereum/messages.js';

const chat = 'views_chat';

this.M = new MessageManager(Session.get('selectedAddress'));

getSelectedConversation = () => {
  return Conversations.findOne(TemplateVar.get('selectedConversation'))
}

getMessages = (conversationId) => {
  return Messages.find({conversationId: conversationId}, {sort: {timestamp: 1}})
}

Template[chat].helpers({
  conversations: () => {
    return Conversations.find();
  },

  selectedConversation: getSelectedConversation,

  isSelected: (id) => {
    return TemplateVar.get('selectedConversation') == id;
  },

  messages: getMessages,

  messageCount: (conversationId) => {
    return getMessages(conversationId).count();
  }
})

sendMessage = () => {
  $('#message-to-send,.sendMessage').attr("disabled","disabled");
  M.sendMessage(getSelectedConversation().address, $('#message-to-send').val())
    .then(() => {
      $('#message-to-send').val('');
      $('#message-to-send,.sendMessage').removeAttr("disabled");
    });
}

Template[chat].events({
  'click .conversationItem': (e) => {
    TemplateVar.set('selectedConversation', $(e.currentTarget).data('id'));
  },

  'click .sendMessage': (e) => sendMessage(),
  'keyup #message-to-send': (e) => {
    const key = e.keyCode ? e.keyCode : e.which;
    if (key == 13)
      sendMessage();
  }
})
