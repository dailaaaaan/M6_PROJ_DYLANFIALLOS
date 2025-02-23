//importa las librerías necesarias
const express = require('express'); //framework para crear el servidor
const axios = require('axios'); //para hacer solicitudes HTTP a APIs externas
const cors = require('cors'); //para permitir solicitudes desde el frontend
const app = express(); //crear una instancia de Express
const PORT = 3000; //puerto en el que correrá el servidor

//habilitar Cors para permitir solicitudes desde el frontend
app.use(cors());

//ruta para obtener informacion de una poblacion desde GeoNames
app.get('/geonames', async (req, res) => {
    const { q } = req.query; //obtener el nombre de la población desde la query string
    try {
        //hacer una solicitud a la API de Geonames para buscar la poblacion____________________________mi id en Geonames
        const response = await axios.get(`http://api.geonames.org/searchJSON?q=${q}&maxRows=1&username=dailaaaaaaaan`);
        
        //para imprimir la respuesta de Geonames en la consola para depuracion
        console.log('Respuesta de GeoNames:', response.data);

        //verificar si Geonames devolvio datos validos
        if (response.data.geonames && response.data.geonames.length > 0) {
            //si hay datos, directos pal frontend en formato JSON
            res.json(response.data);
        } else {
            //si no hay datos devolver un error 404
            res.status(404).json({ error: 'No se encontraron datos para la población especificada' });
        }
    } catch (error) {
        //si hay un error en la solicitud a Geonames, imprimirlo en la consola
        console.error('Error en la solicitud a GeoNames:', error.message);
        
        //devolver un error 500 al frontend
        res.status(500).json({ error: 'Error al obtener datos de GeoNames', details: error.message });
    }
});

//iniciar el servidor y escuchar en el puerto
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});