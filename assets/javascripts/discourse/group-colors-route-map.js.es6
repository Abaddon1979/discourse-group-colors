// assets/javascripts/discourse/group-colors-route-map.js.es6
export default {
  resource: 'admin.adminPlugins',
  path: '/admin/plugins',
  map() {
    this.route('groupColors', { path: '/group-colors' });
  }
};