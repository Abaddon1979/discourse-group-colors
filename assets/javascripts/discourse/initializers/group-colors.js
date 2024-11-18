// assets/javascripts/discourse/initializers/group-colors.js

import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "group-colors",
  initialize() {
    withPluginApi("0.8", (api) => {
      api.addPluginPane("group-colors", {
        name: "group-colors",
        title: "group_colors.title",
        icon: "paint-brush",
        component: () => import("./admin/group-colors"),
      });

      api.createWidget("group-member-color-input", {
        tagName: "input.group-member-color-input",
        attributes: { type: "color" },
        didInsertElement() {
          this.element.value = this.attrs.color || "#000000";
          this.element.addEventListener("change", () => {
            this.attrs.onChange(this.element.value);
          });
        },
      });

      api.modifyClass("component:group-show", {
        pluginId: "group-colors",
        didInsertElement() {
          this._super(...arguments);
          this.registerColorInput();
        },
        registerColorInput() {
          const onChange = (color) => {
            this.updateGroupColor(color);
          };
          this.attachWidget(
            this.group.id,
            api.container.lookup("widget:group-member-color-input", {
              color: this.group.custom_fields?.color,
              onChange,
            })
          );
        },
        updateGroupColor(color) {
          api.put(`/admin/groups/${this.group.id}/custom_fields`, {
            color: color,
          });
        },
      });

      // Decorate the user name in various locations
      const decorateUserName = (helper) => {
        const user = helper.attrs.user;
        if (user) {
          const groups = user.groups.sort(
            (a, b) => a.custom_fields.rank - b.custom_fields.rank
          );
          const groupWithColor = groups.find(
            (group) => group.custom_fields.color
          );
          if (groupWithColor) {
            helper.addRawClass(`group-color-${groupWithColor.id}`);
            helper.rawHtml(
              `<style>
                .group-color-${groupWithColor.id} {
                  color: ${groupWithColor.custom_fields.color} !important;
                }
              </style>`
            );
          }
        }
      };

      api.decorateWidget("poster-name:after", decorateUserName);
      api.decorateWidget("username:after", decorateUserName);
      api.decorateWidget("chat-message-username:after", decorateUserName);
      api.decorateWidget("user-card-username:after", decorateUserName);
    });
  },
};