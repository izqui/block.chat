import kbpgp from '/imports/lib/kbpgp';
import {KeyStorePromise} from './deployed';

class Keys {
  constructor() {
    KeyStorePromise.then((ks) => this.keystore = ks);
  }

  generateKeyPair(username, address) {
    return this.generateNewRSAKeypair(`${username} <${address}>`)
      .then(([publickey, privatekey]) => {
        return this.saveKeys(username, address, publickey, privatekey);
      })
      .catch(e => console.log(e))
  }

  saveKeys(username, address, publickey, privatekey) {
    return this.savePrivateKey(address, privatekey)
      .then(() => this.registerUsernameWithKey(address, username, publickey))
  }

  registerUsernameWithKey(address, username, publicKey) {
    return this.keystore.register(username, publicKey, {from: address, gas: 5000000});
  }

  savePrivateKey(address, privateKey) {
    return Promise.resolve(Session.setPersistent(`pk_${address}`, privateKey));
  }

  generateNewRSAKeypair(userid) {
    var keypair;
    return generateRSAPromise(userid)
      .then((k) => {
        keypair = k;
        return simplePromise(k.sign, k, {});
      })
      .then(() => {
        var ks = [keypair.export_pgp_public, keypair.export_pgp_private];
        return Promise.all(ks.map(x => simplePromise(x, keypair, {})));
      })
  }
}

simplePromise = (f, o, args) => {
  return new Promise((resolve, reject) => {
    f.apply(o, [args || {}, (err, result) => {
      if (err)
        return reject(err);
      resolve(result);
    }]);
  });
}

generateRSAPromise = (userid) => {
  return new Promise((resolve, reject) => {
    kbpgp.KeyManager.generate_rsa({userid: userid}, function (err, keypair) {
      if (err)
        return reject(err);
      resolve(keypair);
    })
  });
}

export default new Keys();
