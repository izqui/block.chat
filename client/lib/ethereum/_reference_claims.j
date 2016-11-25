import {Insurance} from './deployed';
import {Claim} from './contracts';

Claims = new Mongo.Collection('insurance_claims', {connection: null});
// var persistentClaims = new PersistentMinimongo2(Claims);
// persistentClaims.refresh();

Claims.initExaminer = function() {
  watchForClaims(null);
}

Claims.initInsured = function() {
  // Claims.clear(); // No need to clear right?
  const accounts = EthAccounts.find({}).fetch().map((a) => { return a.address });
  watchForClaims(accounts);
  Promise.all(accounts.map(Insurance.insuredClaims.call))
    .then((a) => _.flatMap(a).forEach(addNewClaim))
}

Claims.clear = () => {
  _.each(Claims.find({}).fetch(), (c) => {
      Claims.remove(c._id);
  });
}

addNewClaim = (claimAddress) => {
  const claim = Claim.at(claimAddress);
  updateClaim(claim)
    .then(subscribeToClaimChanges)
    .catch((e) => {console.log("error getting claim", e)})
}

saveClaim = (props) => {
  return Promise.resolve(Claims.upsert(`cl_${props.address}`, props));
}

class ClaimConverter {
  constructor(claim) {
    this.address = claim.address;

    this.evidence = claim.claimEvidence.call();
    this.ownerAddress = claim.ownerAddress.call();
    this.beneficiaryAddress = claim.beneficiaryAddress.call();

    this.state = claim.currentState.call().then(this.convertNumber);
    this.createDate = claim.createDate.call().then(this.convertNumber).then(this.parseTimestamp);
    this.modifiedDate = claim.modifiedDate.call().then(this.convertNumber).then(this.parseTimestamp);
  }

  convertNumber(number) {
    return Promise.resolve(number.valueOf());
  }

  parseTimestamp(timestamp) {
    return Promise.resolve(moment.unix(timestamp));
  }
}

updateClaim = (claim) => {
  return Promise.allProperties(new ClaimConverter(claim))
    .then(saveClaim)
    .then(() => { return Promise.resolve(claim) })
}

subscribeToClaimChanges = (claim) => {
  claim.StateDidTransition({}).watch((err, ev) => {
    updateClaim(claim);
  });

  claim.StateTransitionNotAllowed({}).watch((err, ev) => {
    console.log('state transition not allowed', claim.address)
  });
}


watchForClaims = (accounts) => {
  Insurance.NewClaim({originator: accounts}).watch((err, ev) => {
    addNewClaim(ev.args.claimAddress);
  });
}

export default Claims;
