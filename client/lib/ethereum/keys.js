import kbpgp from '/imports/lib/kbpgp';
import {KeyStorePromise} from './deployed';
import web3 from './web3';

class KeyManager {
  constructor() {
    KeyStorePromise.then((ks) => this.keyStore = ks);
  }

  generateKeyPair(username, address) {
    return this.generateNewRSAKeypair(`${username} <${address}>`)
      .then(([publicKey, privateKey]) => {
        return this.saveKeys(username, address, publicKey, privateKey);
      })
      .catch(e => console.log(e))
  }

  getAddressForRecipient(recipient) {
    var address;
    if (web3.isAddress(recipient)) {
      address = Promise.resolve(recipient);
    }

    return address || this.keyStore.getAddressForUsername.call(recipient);
  }

  encryptPayload(address, payload) {
    return this.keyStore.getPublicKeyForAddress.call(address)
      .then((key) => {
        return pgpEncryptPromise(key, payload);
      });
  }

  decryptPayload(payload, address) {
    return pgpDecryptPromise(Session.get(`pk_${address}`), payload);
  }

  checkPublicKeyForAddress(address) {
    return this.keyStore.getPublicKeyForAddress.call(address)
      .then((pk) => {
        return Promise.resolve(pk == Session.get(`p_${address}`));
      });
  }

  saveKeys(username, address, publicKey, privateKey) {
    return this.saveKeysLocally(address, publicKey, privateKey)
      .then(() => this.registerUsernameWithKey(address, username, publicKey))
  }

  registerUsernameWithKey(address, username, publicKey) {
    return this.keyStore.register(username, publicKey, {from: address, gas: 5000000});
  }

  saveKeysLocally(address, publicKey, privateKey) {
    Session.setPersistent(`pk_${address}`, privateKey);
    Session.setPersistent(`p_${address}`, publicKey);
    return Promise.resolve();
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
  return simplePromise(kbpgp.KeyManager.generate_rsa, this, {userid: userid});
}

pgpEncryptPromise = (key, payload) => {
  return simplePromise(kbpgp.KeyManager.import_from_armored_pgp, this, {armored: key})
    .then((pgpkey) => {
      return simplePromise(kbpgp.box, this, {msg: payload, encrypt_for: pgpkey});
    });
}

pgpDecryptPromise = (key, payload) => {
  return simplePromise(kbpgp.KeyManager.import_from_armored_pgp, this, {armored: key})
    .then((pgpkey) => {
      var ring = new kbpgp.keyring.KeyRing;
      ring.add_key_manager(pgpkey);
      return simplePromise(kbpgp.unbox, this, {armored: payload, keyfetch: ring});
    })
    .then((literals) => {
      return Promise.resolve(literals[0].toString());
    });
}

export const keyManager = new KeyManager();
