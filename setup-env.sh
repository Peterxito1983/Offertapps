#!/bin/bash
# Script de configuración de entornos para OffertApps

echo "Configuración de entornos para OffertApps"

case $1 in
  "dev")
    echo "Configurando entorno de desarrollo..."
    if [ -f .env.local ]; then
      echo "Usando configuración de .env.local"
      cp .env.local .env
    else
      echo "ERROR: No se encontró el archivo .env.local"
      echo "Por favor cree un archivo .env.local con sus credenciales de desarrollo"
      exit 1
    fi
    ;;
  "staging")
    echo "Configurando entorno de staging..."
    if [ -f .env.staging ]; then
      echo "Usando configuración de .env.staging"
      cp .env.staging .env
    else
      echo "ERROR: No se encontró el archivo .env.staging"
      echo "Por favor cree un archivo .env.staging con sus credenciales de staging"
      exit 1
    fi
    ;;
  "prod")
    echo "Configurando entorno de producción..."
    if [ -f .env.production ]; then
      echo "Usando configuración de .env.production"
      cp .env.production .env
    else
      echo "ERROR: No se encontró el archivo .env.production"
      echo "Por favor cree un archivo .env.production con sus credenciales de producción"
      exit 1
    fi
    ;;
  *)
    echo "Uso: $0 {dev|staging|prod}"
    echo "  dev     - Configura el entorno de desarrollo"
    echo "  staging - Configura el entorno de staging"
    echo "  prod    - Configura el entorno de producción"
    exit 1
    ;;
esac

echo "Entorno configurado correctamente!"
echo "Variables de entorno actuales:"
grep -v '^#' .env | grep -v '^$' || echo "No se encontraron variables (archivo vacío o solo comentarios)"

echo ""
echo "Para aplicar los cambios, ejecute:"
echo "source .env  # (solo para variables que se usan en tiempo de ejecución)"
echo "o reinicie su entorno de desarrollo"