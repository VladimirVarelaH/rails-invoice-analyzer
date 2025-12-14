class InvoicesController < ApplicationController
  before_action :set_invoice, only: [:show, :update, :destroy]
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  # GET /invoices
  def index
    @invoices = Invoice.all
    render json: @invoices, include: [:category, :invoice_items]
  end

  # GET /invoices/:id
  def show
    render json: @invoice, include: [:category, :invoice_items]
  end

  # POST /invoices
  def create
    @invoice = Invoice.new(invoice_params)
    # DEBUG params
    puts "Received invoice params: #{invoice_params.inspect}"

    if @invoice.save
      render json: @invoice, include: [:category, :invoice_items], status: :created
    else
      render json: { errors: @invoice.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /invoices/:id
  def update
    if @invoice.update(invoice_params)
      render json: @invoice, include: [:category, :invoice_items]
    else
      render json: { errors: @invoice.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /invoices/:id
  def destroy
    @invoice.destroy
    head :no_content
  end

  private

  def set_invoice
    @invoice = Invoice.find(params[:id])
  end

  # Permitimos atributos anidados para crear los invoice_items junto al invoice
  def invoice_params
    params.require(:invoice).permit(
      :billed_at,
      :category_id,
      :issuer,
      :city_name,
      :address,
      :issuer_tax_id,
      invoice_items_attributes: [:name, :qtty, :price]
    )
  end

  def not_found
    render json: { error: "Invoice not found", status: 404 }, status: :not_found
  end
end
