BlazeLayout.setRoot('body');

renderView = (viewName) => {
  return (params, queryParams) => {
    BlazeLayout.render('layout_main', {header: 'layout_header', main: `views_${viewName}`});
  }
}

routeObject = (routeName) => {
  return {name: routeName, action: renderView(routeName)};
}

// Insurance routes
FlowRouter.route('/im', routeObject('chat'));

FlowRouter.notFound = {
  action: () => { FlowRouter.go('chat') }
}
