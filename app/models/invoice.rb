class Invoice < ApplicationRecord
  belongs_to :category
  has_many :invoice_items, dependent: :destroy

  validates :issuer, presence: true
  validates :billed_at, presence: true

  accepts_nested_attributes_for :invoice_items, allow_destroy: true
end
