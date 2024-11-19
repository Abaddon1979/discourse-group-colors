import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'group-colors',
  initialize() {
    withPluginApi('1.x', (api) => {  // Use latest compatible version

      const applyGroupColors = () => {  // No need for async here
        try {
          // Target username elements on the page. Adjust selectors if necessary.
          const usernameElements = document.querySelectorAll(
            '.chat-message-info__username__name, .username a, .name-username-wrapper'
          );

          usernameElements.forEach((element) => {
            const userId = element.dataset.userId; // Get the user ID from the element's data attribute

            if (userId) {
              // Access the user object directly from Discourse.
              const user = Discourse.User.get(userId);
              if(user){
              const groups = user.groups.sort(
                (a, b) => a.custom_fields.rank - b.custom_fields.rank
              );
              const groupWithColor = groups.find(
                (group) => group.custom_fields.color
              );
              if(groupWithColor){

                api.decorateWidget(`user-card-${user.id}`, 'after', { // Adjust placement as needed
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



      api.onPageChange(() => {
        applyGroupColors();
      });
    });
  },
};