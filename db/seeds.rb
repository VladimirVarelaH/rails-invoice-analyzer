# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

CATEGORIES = {
  'Alimentación' => { icon: 'utensils', color: 'green' },
  'Salud' => { icon: 'pill', color: 'red' },
  'Transporte' => { icon: 'car', color: 'blue' },
  'Vestuario' => { icon: 'shirt', color: 'purple' },
  'Hogar' => { icon: 'home', color: 'orange' },
  'Educación' => { icon: 'book', color: 'indigo' },
  'Entretenimiento' => { icon: 'film', color: 'pink' },
  'Servicios' => { icon: 'briefcase', color: 'cyan' },
  'Otros' => { icon: 'shopping-bag', color: 'gray' }
}

puts "Seeding categories..."

CATEGORIES.each do |name, attrs|
  category = Category.find_or_initialize_by(name: name)
  category.icon = attrs[:icon]
  category.color = attrs[:color]
  category.save!
end

puts "✔ Categorías creadas/actualizadas correctamente."
