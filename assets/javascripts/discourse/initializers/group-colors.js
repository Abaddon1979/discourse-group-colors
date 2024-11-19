import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'group-colors',
  initialize() {
    withPluginApi('0.12.3', (api) => { // Use appropriate API version

      const applyGroupColors = async () => {
        try {
          const usersResult = await api.ajax('/admin/users.json', {
             // add any filter parameters as needed
          });
          const users = usersResult.users; // Access the 'users' array from the response
          if(!users){return;}
          users.forEach(async (user) => {
            const groups = user.groups.sort(
              (a, b) => a.custom_fields.rank - b.custom_fields.rank
            );
            const groupWithColor = groups.find(
              (group) => group.custom_fields.color
            );

            if (groupWithColor) {
              const usernameElement = document.querySelector(
                `.chat-message-info__username__name[data-user-id="${user.id}"], .username a[data-user-id="${user.id}"], .name-username-wrapper[data-user-id="${user.id}"]`
              );

              if (usernameElement) {
                api.decorateWidget(`user-card-${user.id}`, 'after', { // Adjust placement as needed
                  name: 'colored-username',
                  attrs: {
                    username: user.username,
                    groupColor: groupWithColor.custom_fields.color,
                  },
                });
              }
            }
          });
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };

      api.onPageChange(() => {
        applyGroupColors();
      });

    });
  },
};