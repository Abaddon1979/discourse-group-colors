# plugin.rb

enabled_site_setting :group_colors_enabled

register_asset "stylesheets/common/group-colors.scss"

after_initialize do
  module ::GroupColors
    class Engine < ::Rails::Engine
      engine_name "group_colors"
      isolate_namespace GroupColors
    end
  end

  GroupColors::Engine.routes.draw do
    get "/" => "group_colors#index"
    put "/reorder" => "group_colors#reorder"
    put "/settings" => "group_colors#settings"
  end

  Discourse::Application.routes.append do
    mount ::GroupColors::Engine, at: "/admin/plugins/group-colors"
  end

  require_dependency "application_controller"

  class ::GroupColors::GroupColorsController < ::ApplicationController
    requires_plugin "group_colors"

    before_action :ensure_admin

    def index
      render json: success_json.merge(
        groups: Group.all.map { |g| g.attributes.merge(custom_fields: g.custom_fields) },
        group_colors_enabled: SiteSetting.group_colors_enabled,
        group_colors_priority_enabled: SiteSetting.group_colors_priority_enabled
      )
    end

    def reorder
      group_ids = params.require(:group_ids)
      group_ids.each_with_index do |group_id, index|
        Group.find(group_id).update!(rank: index + 1)
      end
      render json: success_json
    end

    def settings
      SiteSetting.group_colors_enabled = params[:group_colors_enabled]
      SiteSetting.group_colors_priority_enabled = params[:group_colors_priority_enabled]
      render json: success_json
    end
  end
end