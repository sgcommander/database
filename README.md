# Stargate: Galactic Commander Database Tools

Este proyecto contiene todo lo necesario para correr una instancia de la base de datos del juego y realizar operaciones sobre ella.

## Comenzando 🚀

Estas instrucciones te permitirán obtener una base de datos en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

### Pre-requisitos 📋

Necesitarás instalar [Docker](https://www.docker.com/) y Docker Compose para arrancar el proyecto.

### Instalación 🔧

Copia y renombra el fichero de configuración de Docker para crear tu fichero de configuración para el proyecto:

```
cp .env.docker .env
```

Este fichero contiene las configuraciones para arrancar el proyecto en Docker, deberás modificarlas para atacar a una base de datos en otro servidor.

### Ejecución ⚙️

Para ejecutar el proyecto con Docker Compose situate en el directorio raiz del proyecto y ejecuta:

```
docker-compose -f docker-compose.yml up
```

Una vez arrancado el entorno puedes ejecutar los siguientes comandos sobre la base de datos del juego.

#### Creación del universo 🪐

El siguiente comando creará la estructura de la base de datos y generará un universo según los parámetros del fichero .env:

```
npm run bigbang
```

Versión verbose para depuración:

```
npm run bigbang:verbose
```

#### Doping 💉

El siguiente comando reduce los tiempos de contrucción, investigación, misiones y recarga de especiales para propósitos de desarrollo sobre el universo ya creado por el comando anterior:

```
npm run doping
```

Versión verbose para depuración:

```
npm run doping:verbose
```

## Construido con 🛠️

* [NodeJS](https://nodejs.org/)

## Autores ✒️

* **David** - [damarte](https://github.com/damarte)

## Licencia 📄

Este proyecto está bajo la Licencia GNU General Public License - mira el archivo [LICENSE.md](LICENSE.md) para detalles