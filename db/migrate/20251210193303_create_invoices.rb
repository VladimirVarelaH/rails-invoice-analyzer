class CreateInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :invoices do |t|
      t.datetime :billed_at
      t.references :category, null: false, foreign_key: true
      t.string :issuer

      t.timestamps
    end
  end
end
