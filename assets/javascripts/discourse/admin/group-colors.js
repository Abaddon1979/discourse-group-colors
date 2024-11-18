// assets/javascripts/discourse/admin/group-colors.js

import Component from "@ember/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default   
 Component.extend({
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
      color,
    });
  },

  @action
  async toggleSetting(settingName) {
    this.set(settingName, !this.get(settingName));
    try {
      await this.ajax.put("/admin/plugins/group-colors/settings", {
        [settingName]: this.get(settingName),
      });
      window.location.reload();
    } catch (error) {
      console.error(`Error toggling ${settingName}:`, error);
    }
  },
});