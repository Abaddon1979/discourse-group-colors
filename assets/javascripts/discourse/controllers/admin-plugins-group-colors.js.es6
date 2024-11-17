// assets/javascripts/discourse/controllers/admin-plugins-group-colors.js.es6
import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class AdminPluginsGroupColorsController extends Controller {
  @service siteSettings;
  @service store;

  constructor() {
    super(...arguments);
    this.loadGroups();
  }

  async loadGroups() {
    try {
      const groups = await this.store.findAll('group');
      this.set('groups', groups);
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async updateGroupColor(group, color) {
    if (!this.siteSettings.group_colors_enabled) return;

    try {
      await ajax(`/groups/${group.id}/color`, {
        type: "PUT",
        data: {
          color: color,
          color_rank: group.custom_fields.color_rank
        }
      });
      
      group.set('custom_fields.color', color);
      this.flash(I18n.t("group_colors.save_success"), "success");
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async updateGroupRank(group, event) {
    if (!this.siteSettings.group_colors_enabled || !this.siteSettings.group_colors_priority_enabled) return;

    const rank = parseInt(event.target.value, 10);
    if (rank > 0) {
      try {
        await ajax(`/groups/${group.id}/color`, {
          type: "PUT",
          data: {
            color: group.custom_fields.color,
            color_rank: rank
          }
        });
        
        group.set('custom_fields.color_rank', rank);
        this.flash(I18n.t("group_colors.save_success"), "success");
      } catch (error) {
        popupAjaxError(error);
      }
    }
  }
}