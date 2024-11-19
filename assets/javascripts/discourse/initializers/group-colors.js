import { withPluginApi } from 'discourse/lib/plugin-api';
import { findAll } from 'discourse/models';

export default {
  name: 'group-colors',
  initialize() {
    withPluginApi('1.0', (api) => { // Use the latest supported API version

      const applyGroupColors = async () => {
        const users = await findAll('user'); // Fetch all users using Discourse's data store

        users.forEach(async (user) => {
          const groups = user.groups.sort(
            (a, b) => a.custom_fields.rank - b.custom_fields.rank
          );
          const groupWithColor = groups.find(
            (group) => group.custom_fields.color
          );

          if (groupWithColor) {
            // Find the corresponding username element and replace it with the component
            const usernameElement = document.querySelector(
              `.chat-message-info__username__name[data-user-id="${user.id}"], .username a[data-user-id="${user.id}"], .name-username-wrapper[data-user-id="${user.id}"]`
            );

            if (usernameElement) {
              // Use api.decorateWidget to inject the component
              api.decorateWidget(`user-card-${user.id}`, 'after', {
                name: 'colored-username',
                attrs: {
                  username: user.username,
                  groupColor: groupWithColor.custom_fields.color,
                },
              });
            }
          }
        });
      };

      api.onPageChange(() => {
        applyGroupColors();
      });
    });
  },
};