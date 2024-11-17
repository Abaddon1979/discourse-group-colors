// assets/javascripts/discourse/controllers/admin-plugins-group-colors.js.es6
import Controller from "@ember/controller";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";

export default Controller.extend({
  init() {
    this._super(...arguments);
    this.loadGroups();
  },

  async loadGroups() {
    try {
      const response = await ajax("/groups.json");
      this.set("groups", response.groups);
    } catch (error) {
      console.error("Error loading groups:", error);
      this.flash(I18n.t("group_colors.load_error"), "error");
    }
  },

  @action
  async saveGroupSettings(group) {
    try {
      await ajax(`/groups/${group.id}/color`, {
        type: "PUT",
        data: {
          color: group.color,
          color_rank: group.color_rank
        }
      });
      this.flash(I18n.t("group_colors.save_success"), "success");
    } catch (error) {
      console.error("Error saving group settings:", error);
      this.flash(I18n.t("group_colors.save_error"), "error");
    }
  }
});