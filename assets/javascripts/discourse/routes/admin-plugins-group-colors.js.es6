// assets/javascripts/discourse/routes/admin-plugins-group-colors.js.es6
import DiscourseRoute from "discourse/routes/discourse";

export default class AdminPluginsGroupColorsRoute extends DiscourseRoute {
  model() {
    return this.store.findAll("group");
  }

  setupController(controller, model) {
    controller.set("groups", model);
  }
}