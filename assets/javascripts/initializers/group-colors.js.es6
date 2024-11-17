// assets/javascripts/discourse/initializers/group-colors.js.es6
import { withPluginApi } from "discourse/lib/plugin-api";
import { iconHTML } from "discourse-common/lib/icon-library";

export default {
  name: "group-colors",
  initialize() {
    withPluginApi("0.8.31", api => {
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
          
          document.querySelectorAll(`[data-user-card="${this.user?.username}"]`).forEach(trigger => {
            trigger.removeEventListener("mouseenter", this._showCard);
            trigger.removeEventListener("mouseleave", this._hideCard);

            trigger.addEventListener("mouseenter", this._showCard.bind(this));
            trigger.addEventListener("mouseleave", this._hideCard.bind(this));
          });

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

      // Add hover styles
      api.decorateCooked($elem => {
        const users = $elem.find('[data-user-card]');
        users.addClass('discourse-group-colors-hover');
      }, { id: 'discourse-group-colors' });
    });
  }
};