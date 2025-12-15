class ChangeQttyToFloatInInvoiceItems < ActiveRecord::Migration[8.1]
  def change
    change_column :invoice_items, :qtty, :decimal, precision: 15, scale: 10
  end
end
