// assets/javascripts/discourse/controllers/admin-plugins-group-colors.js.es6
import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import Sortable from "discourse/lib/sortable";

export default class AdminPluginsGroupColorsController extends Controller {
  @service siteSettings;
  @service store;
  sortableInstance = null;

  constructor() {
    super(...arguments);
    this.loadGroups();
  }

  async loadGroups() {
    try {
      const groups = await this.store.findAll('group');
      this.set('groups', groups);
      this.setupSortable();
    } catch (error) {
      popupAjaxError(error);
    }
  }

  get sortedGroups() {
    return this.groups?.toArray().sort((a, b) => {
      return (a.custom_fields.color_rank || 999) - (b.custom_fields.color_rank || 999);
    });
  }

  setupSortable() {
    const element = document.querySelector(".groups-list");
    if (!element) return;

    this.sortableInstance = new Sortable(element, {
      handle: ".group-sort-handle",
      draggable: ".sortable-group",
      onEnd: this.updateOrder.bind(this)
    });
  }

  @action
  async updateOrder(event) {
    const groups = [...document.querySelectorAll(".sortable-group")];
    const newOrder = groups.map((element, index) => ({
      id: element.dataset.groupId,
      rank: index + 1
    }));

    try {
      await Promise.all(
        newOrder.map(({ id, rank }) =>
          ajax(`/groups/${id}/color`, {
            type: "PUT",
            data: {
              color_rank: rank
            }
          })
        )
      );

      // Update local ranks
      newOrder.forEach(({ id, rank }) => {
        const group = this.groups.findBy('id', id);
        if (group) {
          group.set('custom_fields.color_rank', rank);
        }
      });

      this.flash(I18n.t("group_colors.order_saved"), "success");
    } catch (error) {
      popupAjaxError(error);
      this.loadGroups();
    }
  }

  @action
  async updateGroupColor(group, color) {
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

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }
  }
}