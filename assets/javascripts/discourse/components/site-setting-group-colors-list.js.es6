import Component from "@ember/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class SiteSettingGroupColorsList extends Component {
  @service store;
  @service siteSettings;

  init() {
    super.init(...arguments);
    this.loadGroups();
  }

  async loadGroups() {
    try {
      const groups = await this.store.findAll('group');
      this.set('groups', groups.sortBy('custom_fields.color_rank'));
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async updateColor(group, color) {
    try {
      await ajax(`/groups/${group.id}/color`, {
        type: "PUT",
        data: {
          color: color,
          color_rank: group.custom_fields.color_rank
        }
      });
      group.set('custom_fields.color', color);
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async updateOrder(groupIds) {
    try {
      await Promise.all(
        groupIds.map((id, index) => 
          ajax(`/groups/${id}/color`, {
            type: "PUT",
            data: {
              color_rank: index + 1
            }
          })
        )
      );
      await this.loadGroups(); // Reload to show new order
    } catch (error) {
      popupAjaxError(error);
    }
  }
}