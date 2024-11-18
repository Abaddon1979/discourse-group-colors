import Component from "@ember/component";
import { ajax } from "discourse/lib/ajax";
import { action } from "@ember/object";

export default class GroupColorsGroups extends Component {
  tagName = "";

  constructor() {
    super(...arguments);
    this.loadGroups();
  }

  async loadGroups() {
    try {
      const result = await ajax("/groups/list");
      this.set("groups", result.groups.sortBy("rank"));
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  }

  @action
  async updateColor(group, color) {
    try {
      await ajax(`/groups/${group.id}/color`, {
        type: "PUT",
        data: { color }
      });
      group.color = color;
    } catch (error) {
      console.error("Error updating color:", error);
    }
  }

  @action
  async updateOrder(groups) {
    try {
      await Promise.all(
        groups.map((group, index) =>
          ajax(`/groups/${group.id}/color`, {
            type: "PUT",
            data: { color_rank: index + 1 }
          })
        )
      );
      this.set("groups", groups);
    } catch (error) {
      console.error("Error updating order:", error);
      this.loadGroups();
    }
  }
}