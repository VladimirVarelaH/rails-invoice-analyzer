class AddDetailsToInvoices < ActiveRecord::Migration[8.1]
  def change
    add_column :invoices, :city_name, :string
    add_column :invoices, :address, :string
    add_column :invoices, :issuer_tax_id, :string
  end
end
