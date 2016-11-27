import kbpgp from '/imports/lib/kbpgp';
import {KeyStorePromise} from './deployed';

class Keys {
  constructor() {
    KeyStorePromise.then((ks) => this.keystore = ks);
  }

  generateKeyPair(username, address) {
    console.log('generating keypair')
    console.log(this.keystore)
    kbpgp.KeyManager.generate_rsa({userid: username}, (err, keypair) => {
      console.log(keypair)
      keypair.sign({}, (err) => {
        keypair.export_pgp_public({}, (err, str) => {
          console.log("pk", str, err)
          this.keystore.register(username, str, {from: address, gas: 5000000}).catch(console.log)
        })
      });
    });
  }

}

export default new Keys();
