class Category < ApplicationRecord
  has_many :invoices, dependent: :nullify
  
  validates :name, presence: true
end
