// assets/javascripts/discourse/components/group-color-picker.js.es6
import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  classNames: ["group-color-picker"],
  
  @action
  updateColor(color) {
    this.set("group.color", color);
    this.save(this.group);
  },
  
  @action
  updateRank(event) {
    const rank = parseInt(event.target.value, 10);
    if (rank > 0) {
      this.set("group.color_rank", rank);
      this.save(this.group);
    }
  }
});