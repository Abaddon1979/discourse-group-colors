// assets/javascripts/discourse/initializers/group-colors.js.es6
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "group-colors",
  initialize() {
    withPluginApi("0.8.31", api => {
      // Chat message username colors
      api.modifyClass('component:chat-message', {
        pluginId: 'discourse-group-colors',
        
        didInsertElement() {
          this._super(...arguments);
          this._applyUserColor();
          this._setupHoverBehavior();
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
        },

        _setupHoverBehavior() {
          const username = this.element?.querySelector('.chat-message-info__username');
          if (!username) return;
          
          username.addEventListener('mouseenter', (e) => {
            const userCard = document.querySelector('.user-card');
            if (userCard) {
              const rect = username.getBoundingClientRect();
              userCard.style.position = 'fixed';
              userCard.style.top = `${rect.bottom + window.scrollY + 5}px`;
              userCard.style.left = `${rect.left + window.scrollX}px`;
              userCard.style.opacity = '1';
              userCard.style.pointerEvents = 'auto';
              userCard.style.display = 'block';
            }
          });

          username.addEventListener('mouseleave', (e) => {
            const userCard = document.querySelector('.user-card');
            if (userCard && !userCard.contains(e.relatedTarget)) {
              setTimeout(() => {
                userCard.style.opacity = '0';
                userCard.style.pointerEvents = 'none';
              }, 500);
            }
          });
        }
      });

      // Forum post username colors
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

      // User card improvements
      api.modifyClass('component:user-card-contents', {
        pluginId: 'discourse-group-colors',
        
        didInsertElement() {
          this._super(...arguments);
          if (this.user?.group_color) {
            const nameWrapper = this.element?.querySelector('.name-username-wrapper');
            if (nameWrapper) {
              nameWrapper.style.color = this.user.group_color;
            }
          }

          // Add groups list to user card
          const user = this.user;
          if (user?.groups) {
            const groupsContainer = document.createElement('div');
            groupsContainer.className = 'user-card-groups';
            
            const groupsList = document.createElement('ul');
            user.groups.forEach(group => {
              const li = document.createElement('li');
              li.textContent = group.name;
              if (group.color) {
                li.style.color = group.color;
              }
              groupsList.appendChild(li);
            });
            
            groupsContainer.appendChild(groupsList);
            this.element.appendChild(groupsContainer);
          }
        }
      });
    });
  }
};