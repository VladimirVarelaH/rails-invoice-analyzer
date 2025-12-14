class CreateInvoiceItems < ActiveRecord::Migration[8.1]
  def change
    create_table :invoice_items do |t|
      t.references :invoice, null: false, foreign_key: true
      t.integer :qtty
      t.decimal :price
      t.string :name

      t.timestamps
    end
  end
end
