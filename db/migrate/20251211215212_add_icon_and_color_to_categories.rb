class AddIconAndColorToCategories < ActiveRecord::Migration[8.1]
  def change
    add_column :categories, :icon, :string
    add_column :categories, :color, :string
  end
end
