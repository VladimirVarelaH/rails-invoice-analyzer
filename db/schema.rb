# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_12_11_215212) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "categories", force: :cascade do |t|
    t.string "color"
    t.datetime "created_at", null: false
    t.string "icon"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "invoice_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "invoice_id", null: false
    t.string "name"
    t.decimal "price"
    t.integer "qtty"
    t.datetime "updated_at", null: false
    t.index ["invoice_id"], name: "index_invoice_items_on_invoice_id"
  end

  create_table "invoices", force: :cascade do |t|
    t.string "address"
    t.datetime "billed_at"
    t.bigint "category_id", null: false
    t.string "city_name"
    t.datetime "created_at", null: false
    t.string "issuer"
    t.string "issuer_tax_id"
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_invoices_on_category_id"
  end

  add_foreign_key "invoice_items", "invoices"
  add_foreign_key "invoices", "categories"
end
