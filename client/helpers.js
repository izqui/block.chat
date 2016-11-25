Template.registerHelper('isMist', () => {
  return (typeof mist !== 'undefined');
});

Template.registerHelper('isMistMode', () => {
  return (typeof mist !== 'undefined' && mist.mode === 'mist');
});

Template.registerHelper('formatDate', (date) => {
  return moment(date).format('MM-DD-YYYY');
});

Template.registerHelper('formatTime', (date) => {
  return moment(date).format('HH:mm');
});

Template.registerHelper('remainingDays', (date) => {
  return moment(date).from(moment());
});

// Hacks
Template.registerHelper('countGreaterThan', (a, b) => { return a.count() > b });
Template.registerHelper('exec', (o, f) => { o[f]() });
