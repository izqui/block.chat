import {BlockChat as BC} from './contracts';

export const BlockChat = !Meteor.settings.deployed ? BC.deployed() : BC.at(Meteor.settings.deployed.blockchat);
