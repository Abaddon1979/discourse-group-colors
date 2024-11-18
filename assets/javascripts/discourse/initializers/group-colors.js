// assets/javascripts/discourse/initializers/group-colors.js

import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "group-colors",
  initialize() {
    withPluginApi("0.8", (api) => {
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

      const addGroupAttributeAndColor = () => {
        const elements = document.querySelectorAll(
          '.chat-message-info__username__name, .username a, .name-username-wrapper'
        );

        elements.forEach((element) => {
          const username = element.textContent.trim();
          const user = Discourse.User.findByUsername(username);

          if (user) {
            const groups = user.groups.sort(
              (a, b) => a.custom_fields.rank - b.custom_fields.rank
            );
            const groupWithColor = groups.find(
              (group) => group.custom_fields.color
            );

            if (groupWithColor) {
              // Add the group name as an attribute
              element.setAttribute('data-group', groupWithColor.id);

              // Apply the color using a CSS variable
              element.style.setProperty(
                '--group-color',
                groupWithColor.custom_fields.color
              );
            }
          }
        });
      };

      api.onPageChange(() => {
        addGroupAttributeAndColor();
      });
    });
  },
};