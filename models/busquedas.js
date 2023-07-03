const fs = require('fs');

const axios = require('axios');



class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        //TODO: Leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        // Capitalizar cada palabra titlecase
        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ')
        })
    }

    get paramsMapBox(){
        return {
            'access_token':process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather(){
        return {
            'appid':process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }


    async ciudad( lugar = '' ){
        try {
            
            //Petición HTTP

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapBox

            });

            const resp = await instance.get()

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));
    

        } catch (error) {
            return [];
        }

    }

    async climaLugar ( lat, lon ) {
        try{
            // instance axios.create argumentos, base url, params

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon }
            });

            const resp = await instance.get();
            const { weather, main } = resp.data;

            // respuesta, extraer info resp.data

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                normal: main.temp
            }


        } catch ( error ) {
            console.log( error )

        }
    }

    agregarHistorial( lugar = '' ) {

        // TODO: Prevenir duplicados

        if ( this.historial.includes( lugar.toLowerCase() ) ){
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift( lugar.toLowerCase() );


        // Grabar en DB

        this.guardarDB();



    }

    guardarDB(){

        const payload = {
            historial: this.historial,
        }

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    leerDB(){
        // Debe de existir...
        if ( !fs.existsSync(this.dbPath) ) return;     

        // Cargar la información, const info readFileSync... path... {encoding: 'utf-8}

        const info = fs.readFileSync(this.dbPath, 'utf-8');

        const data= JSON.parse( info );

        this.historial = data.historial;

    }


}

module.exports = Busquedas;