# 📊 Rails Invoice Analyzer
Rails Invoice Analyzer es una aplicación desarrollada en Ruby on Rails cuyo objetivo principal es automatizar el análisis de facturas utilizando un servicio de Inteligencia Artificial, extrayendo información relevante y presentándola de forma estructurada para facilitar su revisión y posterior procesamiento.  

El sistema está pensado como una prueba de concepto funcional, priorizando claridad de arquitectura, separación de responsabilidades y uso de buenas prácticas propias del ecosistema Rails.  

## 🔄 Flujo general

1. El usuario interactúa con la aplicación mediante la interfaz web.
2. Se carga una foto de una factura.
3. El sistema envía el contenido de la factura a un servicio de IA (Gemini).
4. La IA devuelve información estructurada (por ejemplo: totales, fechas, ítems).
5. El resultado es procesado y presentado en la interfaz para su revisión.  

Este flujo permite demostrar cómo integrar servicios externos de IA dentro de una aplicación Rails manteniendo el código organizado y extensible.

## 📦 Requisitos previos
Antes de comenzar, asegúrate de tener instalado:  
* Ruby — `3.4.7 recomendada`
* PostgreSQL — `17.5 recomendada`

## 🧰 Instalación
### Clonar el repositorio
```bash
git clone https://github.com/VladimirVarelaH/rails-invoice-analyzer.git
```
### Instalar Bundler (si no está)
```bash
gem install bundler
```
Verifica:
```bash
bundle -v
```
### Instalar las dependencias
```bash
bundle install
```
### Crear el usuario de la DB
```sql
CREATE USER rails_user 
WITH PASSWORD 'rails_pass0970#$' 
SUPERUSER;
```
### Crear y completar el archivo .env
```env
GEMINI_API_KEY=YOUR_API_KEY
```
### Crear la DB
```bash
rails db:create
```
### Ejecutar migraciones
```bash
rails db:migrate
```
### Ejecutar seeders
```bash
rails db:seed
```
### Ejecuta la aplicación
```bash
rails server
```

## 🔮 Mejoras
Si tuviera más tiempo, encfocaría las mejoras en los siguientes puntos.  

### 🧠 Inteligencia Artificial
* Enfocarme en implementar la integración con una aproximación similar al factory/strategy, facilitando el migrar a otros servicios.
* Generar un sistema de detección de "no boletas", para evitar gastar recursos en procesar imágenes basura.  
* Fine-tuning o prompt templates específicos por tipo de factura (servicios, retail, impuestos, internacional).
* Sistema de feedback humano para mejorar la precisión del análisis.  
* Añadir la posibilidad de procesar otros formatos (PDF, XML, etc).

### 🔐 Seguridad y Configuración
* Autenticación y autorización (Devise / JWT).
* Roles de usuario (admin, contador, viewer).
* Almacenamiento de boletas cargadas para auditoría.
* Encriptación de información sensibles.
* Manejo seguro de secretos con Rails Credentials o Vault.

### 📊 UI/UX
* Revisar y mejorar la navegación de la aplicación.  
* Añadir animaciones en el dropdown de los ítems de las boletas.  
* Soporte para carga masiva de facturas.
* Añadir una tabla paginada para la visualización.    
* Exportación en CSV de los resultados.
* Completar el drag and drop en la carga de boletas.

### 🧪 Calidad y DevOps
* Implementación de tests (unitarios, integración, IA mocks).
* CI/CD (GitHub Actions).
* Dockerización completa para desarrollo y producción.
* Logs estructurados y monitoreo (Sentry, Lograge).
