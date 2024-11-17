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
    return nil unless SiteSetting.group_colors_enabled
    
    groups = object.groups.select { |g| g.custom_fields['color'].present? }
    return nil if groups.empty?
    
    if SiteSetting.group_colors_priority_enabled
      # Sort by rank (lower number = higher priority)
      highest_priority_group = groups.min_by { |g| g.custom_fields['color_rank'].to_i || 999 }
      highest_priority_group.custom_fields['color']
    else
      # If priority system disabled, just take first group with color
      groups.first.custom_fields['color']
    end
  end
  
  # Add group color management endpoints
  require_dependency 'groups_controller'
  class ::GroupsController < ::ApplicationController
    before_action :ensure_logged_in, only: [:update_color]
    
    def update_color
      return render json: failed_json unless SiteSetting.group_colors_enabled
      
      group = Group.find(params[:id])
      guardian.ensure_can_edit!(group)

      group.custom_fields['color'] = params[:color] if params[:color].present?
      if SiteSetting.group_colors_priority_enabled && params[:color_rank].present?
        group.custom_fields['color_rank'] = params[:color_rank].to_i
      end
      
      if group.save_custom_fields(true)
        render json: success_json
      else
        render json: failed_json, status: 422
      end
    end
  end

  # Add admin route
  add_admin_route 'group_colors.title', 'group-colors'

  # Add routes
  Discourse::Application.routes.append do
    put '/groups/:id/color' => 'groups#update_color'
    
    # Admin route
    scope "/admin/plugins/group-colors", constraints: StaffConstraint.new do
      get "/" => "admin/plugins#index", constraints: AdminConstraint.new
    end
  end

  # Initialize colors for existing groups if needed
  DiscourseEvent.on(:site_setting_saved) do |name, old_value, new_value|
    if name == :group_colors_enabled && new_value == true
      Group.where(automatic: false).find_each do |group|
        if group.custom_fields['color'].blank?
          # Generate a random color if none exists
          group.custom_fields['color'] = "##{SecureRandom.hex(3)}"
          group.custom_fields['color_rank'] = 999 # Default to lowest priority
          group.save_custom_fields(true)
        end
      end
    end
  end

  # Add UserCard hover behavior
  register_html_builder('server:before-head-close') do
    "<script type='text/discourse-plugin' data-route='group-colors-hover'></script>"
  end

  # Handle user card hover events
  DiscourseEvent.on(:before_user_card_render) do |user, card|
    if SiteSetting.group_colors_enabled && SiteSetting.group_colors_hover_enabled
      if user.group_color
        card.add_class('has-group-color')
        card.add_style("color: #{user.group_color}")
      end
    end
  end
end