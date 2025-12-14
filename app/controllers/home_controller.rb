class HomeController < ApplicationController
  def index
    # Aquí puedes cargar datos o simplemente renderizar la vista
  end
end
# app/controllers/home_controller.rb
class HomeController < ApplicationController
  require "json"
  require "base64"
  require "net/http"
  require "uri"
  
  # Load environment variables
  Dotenv.load
  API_KEY = ENV["GEMINI_API_KEY"]
  MODEL = "gemini-2.0-flash"

  def index
    # Solo renderiza la vista normal
  end

  def extract_invoice
    # --------------------------------------------------
    # Archivo subido
    # --------------------------------------------------
    uploaded_file = params[:invoice_image]
  
    unless uploaded_file
      render json: { error: "No se subió ningún archivo" }, status: :bad_request
      return
    end
  
    # --------------------------------------------------
    # Prompt
    # --------------------------------------------------
    prompt = <<~PROMPT
      Extrae la información de la factura y responde solo con un JSON válido
      que cumpla este JSON Schema exactamente. No incluyas explicación ni texto adicional.
  
      #{File.read(Rails.root.join("app", "assets", "invoice_schema.json"))}
    PROMPT
  
    # --------------------------------------------------
    # Construcción del "part" de imagen
    # --------------------------------------------------
    image_part = {
      inlineData: {
        mimeType: uploaded_file.content_type,
        data: Base64.strict_encode64(uploaded_file.read)
      }
    }
  
    # --------------------------------------------------
    # Configuración de generación
    # --------------------------------------------------
    generation_config = {
      responseMimeType: "application/json",
      responseJsonSchema: JSON.parse(File.read(Rails.root.join("app", "assets", "invoice_schema.json")))
    }
  
    # --------------------------------------------------
    # Payload para Gemini
    # --------------------------------------------------
    payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            image_part
          ]
        }
      ],
      generationConfig: generation_config
    }.to_json
  
    # --------------------------------------------------
    # Llamada HTTP a Gemini
    # --------------------------------------------------
    uri = URI("https://generativelanguage.googleapis.com/v1beta/models/#{MODEL}:generateContent?key=#{API_KEY}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
  
    response = http.post(uri.path + "?" + uri.query, payload, {
      "Content-Type" => "application/json"
    })
  
    # --------------------------------------------------
    # Manejo de la respuesta
    # --------------------------------------------------
    json = JSON.parse(response.body)
  
    if json["candidates"] && json["candidates"][0] && json["candidates"][0]["content"]
      output = json["candidates"][0]["content"]
      render json: output
    else
      render json: { error: "No se pudo extraer la factura", details: json }, status: :bad_request
    end
  end

end
