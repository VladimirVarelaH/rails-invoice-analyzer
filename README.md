# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

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
