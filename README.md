# README

## Instalación
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
