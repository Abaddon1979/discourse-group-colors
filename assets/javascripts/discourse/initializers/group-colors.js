import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'group-colors',
  initialize() {
    withPluginApi('0.12.3', (api) => {

      const applyGroupColors = () => {
        try {
          const usernameElements = document.querySelectorAll(
            '.chat-message-info__username__name, .username a, .name-username-wrapper'
          );

          usernameElements.forEach((element) => {
            const userId = element.dataset.userId;

            if (userId) {
              const user = Discourse.User.get(userId);
              if (user) {
                const groups = user.groups.sort(
                  (a, b) => a.custom_fields.rank - b.custom_fields.rank
                );
                const groupWithColor = groups.find(
                  (group) => group.custom_fields.color
                );

                if (groupWithColor) {
                  api.decorateWidget(`user-card-${user.id}`, 'after', {
                    name: 'colored-username',
                    attrs: {
                      username: user.username,
                      groupColor: groupWithColor.custom_fields.color,
                    },
                  });
                }
              }
            }
          });
        } catch (error) {
          console.error('Error applying group colors:', error);
        }
      };

      api.decorateCooked((cooked) => {
        const post = cooked.node.closest('.cooked');
        if (post) {
          const userId = post.dataset.userId;
          const user = Discourse.User.get(userId);
          if (user) {
            const groups = user.groups.sort(
              (a, b) => a.custom_fields.rank - b.custom_fields.rank
            );
            const groupWithColor = groups.find((group) => group.custom_fields.color);
            if (groupWithColor) {
              post.setAttribute('data-group-color', groupWithColor.custom_fields.color);
            }
          }
        }
      });

      // Call applyGroupColors on initial page load and subsequent page changes
      applyGroupColors();
      api.onPageChange(() => applyGroupColors());

    });
  },
};