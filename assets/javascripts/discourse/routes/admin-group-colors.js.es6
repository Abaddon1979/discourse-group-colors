import DiscourseRoute from "discourse/routes/discourse";

export default class AdminGroupColorsRoute extends DiscourseRoute {
  model() {
    return this.store.findAll('group');
  }
}