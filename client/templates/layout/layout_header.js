Template['layout_header'].helpers({
  isActive: (itemName) => {
    return FlowRouter.getRouteName().includes(itemName) ? 'active' : null;
  },
});
