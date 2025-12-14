class InvoiceItem < ApplicationRecord
  belongs_to :invoice

  validates :qtty, :price, :name, presence: true
end
