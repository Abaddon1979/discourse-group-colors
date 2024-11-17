# name: discourse-group-colors
# about: Colors usernames based on group membership with hover cards
# version: 0.1.0
# authors: Abaddon
# url: https://github.com/Abaddon1979/discourse-group-colors

enabled_site_setting :group_colors_enabled

register_asset 'stylesheets/group-colors.scss'
register_svg_icon "fa-shield-halved"

after_initialize do
  # Register custom fields for groups
  Group.register_custom_field_type('color', :string)
  Group.register_custom_field_type('color_rank', :integer)
  
  # Whitelist custom fields for groups
  DiscoursePluginRegistry.serialized_current_user_fields << "group_colors"
  
  add_to_serializer(:basic_group, :color) { object.custom_fields['color'] }
  add_to_serializer(:basic_group, :color_rank) { object.custom_fields['color_rank'].to_i if object.custom_fields['color_rank'].present? }
  
  # Add to user serializer to get the highest priority color
  add_to_serializer(:user, :group_color) do
    groups = object.groups.select { |g| g.custom_fields['color'].present? && g.custom_fields['color_rank'].present? }
    return nil if groups.empty?
    
    # Sort by rank (lower number = higher priority) and take the highest priority group's color
    highest_priority_group = groups.min_by { |g| g.custom_fields['color_rank'].to_i }
    highest_priority_group.custom_fields['color']
  end
  
  require_dependency 'groups_controller'
  class ::GroupsController < ::ApplicationController
    before_action :ensure_logged_in, only: [:update_color]
    
    def update_color
      group = Group.find(params[:id])
      guardian.ensure_can_edit!(group)

      group.custom_fields['color'] = params[:color]
      group.custom_fields['color_rank'] = params[:color_rank].to_i
      
      if group.save_custom_fields(true)
        render json: success_json
      else
        render json: failed_json, status: 422
      end
    end
  end

  Discourse::Application.routes.append do
    put '/groups/:id/color' => 'groups#update_color'
  end
end