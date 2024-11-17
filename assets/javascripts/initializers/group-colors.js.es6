// assets/javascripts/discourse/initializers/group-colors.js.es6
import { withPluginApi } from "discourse/lib/plugin-api";
import { iconHTML } from "discourse-common/lib/icon-library";

export default {
  name: "group-colors",
  initialize() {
    withPluginApi("0.8.31", api => {
      // Add admin menu item
      api.registerAdminMenu("group-colors", {
        name: "group_colors.title",
        location: "plugins",
        icon: "paint-brush",
        route: "adminPlugins.group-colors"
      });

      // Apply colors to post usernames
      api.decorateWidget('poster-name:after', helper => {
        const user = helper.attrs.user;
        if (user?.group_color) {
          helper.rawHtml(`
            <style>
              [data-user-card="${user.username}"] {
                color: ${user.group_color} !important;
              }
              [data-user-card="${user.username}"] a {
                color: ${user.group_color} !important;
              }
            </style>
          `);
        }
      });

      // Modify chat message usernames
      api.modifyClass('component:chat-message', {
        pluginId: 'discourse-group-colors',
        
        didInsertElement() {
          this._super(...arguments);
          this._applyUserColor();
        },

        didUpdateAttrs() {
          this._super(...arguments);
          this._applyUserColor();
        },

        _applyUserColor() {
          const user = this.message?.user;
          if (user?.group_color) {
            const username = this.element?.querySelector('.chat-message-info__username');
            if (username) {
              username.style.color = user.group_color;
            }
          }
        }
      });

      // Add groups to user cards
      api.modifyClass('component:user-card-contents', {
        pluginId: 'discourse-group-colors',
        
        didInsertElement() {
          this._super(...arguments);
          this._setupHoverBehavior();
          this._applyUserCardColors();
        },

        _setupHoverBehavior() {
          const card = this.element;
          if (!card) return;

          card.style.transition = "opacity 0.3s ease";
          
          // Find all elements that trigger this user card
          document.querySelectorAll(`[data-user-card="${this.user?.username}"]`).forEach(trigger => {
            // Remove existing listeners to prevent duplicates
            trigger.removeEventListener("mouseenter", this._showCard);
            trigger.removeEventListener("mouseleave", this._hideCard);

            // Add new listeners
            trigger.addEventListener("mouseenter", this._showCard.bind(this));
            trigger.addEventListener("mouseleave", this._hideCard.bind(this));
          });

          // Add listener to the card itself to prevent hiding while hovering
          card.addEventListener("mouseenter", () => {
            card.style.opacity = "1";
            card.style.pointerEvents = "auto";
          });

          card.addEventListener("mouseleave", () => {
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
          });
        },

        _showCard(event) {
          const card = this.element;
          if (!card) return;

          // Position the card near the trigger element
          const trigger = event.target;
          const rect = trigger.getBoundingClientRect();
          const offset = 10;

          card.style.position = "fixed";
          card.style.top = `${rect.bottom + offset}px`;
          card.style.left = `${rect.left}px`;
          card.style.opacity = "1";
          card.style.pointerEvents = "auto";
          card.style.zIndex = "9999";
        },

        _hideCard(event) {
          const card = this.element;
          if (!card) return;

          // Check if the mouse is moving to the card itself
          if (!card.contains(event.relatedTarget)) {
            card.style.opacity = "0";
            card.style.pointerEvents = "none";
          }
        },

        _applyUserCardColors() {
          const user = this.user;
          if (!user?.group_color) return;

          const nameWrapper = this.element?.querySelector('.name-username-wrapper');
          if (nameWrapper) {
            nameWrapper.style.color = user.group_color;
          }
        }
      });

      // Add group list to user cards
      api.decorateWidget('user-card-contents:after', helper => {
        const user = helper.attrs.user;
        if (!user?.groups) return;

        return helper.h('div.user-card-groups', [
          helper.h('h3', I18n.t('group_colors.groups_label')),
          helper.h('ul.groups-list', 
            user.groups.map(group => 
              helper.h('li.group-list-item', [
                helper.h('span.group-name', {
                  style: `color: ${group.color || 'inherit'}`
                }, [
                  iconHTML('users'),
                  ` ${group.name} `,
                  group.rank ? `(${I18n.t('group_colors.rank')}: ${group.rank})` : ''
                ])
              ])
            )
          )
        ]);
      });

      // Add hover styles
      api.decorateCooked($elem => {
        const users = $elem.find('[data-user-card]');
        users.addClass('discourse-group-colors-hover');
      }, { id: 'discourse-group-colors' });
    });
  }
};