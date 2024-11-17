// assets/javascripts/discourse/controllers/admin-plugins-group-colors.js.es6
import Controller from "@ember/controller";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class AdminPluginsGroupColorsController extends Controller {
  @action
  async updateGroupColor(group, color) {
    try {
      await ajax(`/groups/${group.id}/color`, {
        type: "PUT",
        data: {
          color: color,
          color_rank: group.color_rank
        }
      });
      group.set('color', color);
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async updateGroupRank(group, rank) {
    try {
      await ajax(`/groups/${group.id}/color`, {
        type: "PUT",
        data: {
          color_rank: rank
        }
      });
      group.set('color_rank', rank);
    } catch (error) {
      popupAjaxError(error);
    }
  }
}