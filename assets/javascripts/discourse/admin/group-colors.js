// assets/javascripts/discourse/admin/group-colors.js

import Component from "@ember/component";
import { action } from "@ember/object";
import I18n from "I18n";
import { inject as service } from "@ember/service";

export default Component.extend({
  ajax: service(),

  groupColorsEnabled: false,
  groupColorsPriorityEnabled: false,

  init() {
    this._super(...arguments);
    this.set("groupColorsEnabled", SiteSetting.group_colors_enabled);
    this.set(
      "groupColorsPriorityEnabled",
      SiteSetting.group_colors_priority_enabled
    );
  },

  @action
  async reorderGroups(groups) {
    try {
      const groupIds = groups.map((group) => group.id);
      await this.ajax.put("/admin/plugins/group-colors/reorder", {
        group_ids: groupIds,
      });

      groups.forEach((group, index) => {
        this.ajax.put(`/admin/groups/${group.id}/custom_fields`, {
          rank: index + 1,
        });
      });

      this.set("model", groups);
    } catch (error) {
      console.error("Error reordering groups:", error);
    }
  },

  @action
  updateColor(group, color) {
    this.ajax.put(`/admin/groups/${group.id}/custom_fields`, {
      color: color,
    });
  },

  @action
  async toggleGroupColorsEnabled() {
    this.set("groupColorsEnabled", !this.groupColorsEnabled);
    try {
      await this.ajax.put("/admin/plugins/group-colors/settings", {
        group_colors_enabled: this.groupColorsEnabled,
      });
    } catch (error) {
      console.error("Error toggling group colors enabled:", error);
    }
  },

  @action
  async toggleGroupColorsPriorityEnabled() {
    this.set(
      "groupColorsPriorityEnabled",
      !this.groupColorsPriorityEnabled
    );
    try {
      await this.ajax.put("/admin/plugins/group-colors/settings", {
        group_colors_priority_enabled: this.groupColorsPriorityEnabled,
      });
    } catch (error) {
      console.error("Error toggling group colors priority enabled:", error);
    }
  },
});