var mqtt = require('mqtt');
const mysql = require('mysql');
const express = require('express');
const cors = require('cors'); 
const app = express();
const morgan = require('morgan');

// settings
app.set('port', 3030);

// Utilities
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
//Routes
app.use(require('./rutas/datos.js'));

var client = mqtt.connect('mqtt://broker.mqtt-dashboard.com');

// Se crea la conexión a MySQL
const connection = mysql.createPool({
    connectionLimit: 500,
    host: 'localhost',
    user: 'root',
    password: '', // Contraseña de MySQL
    database: 'TransporteAlimentos',
    port: 3306
});

client.on('connect', function () {
    client.subscribe('controlcamion/01', function (err) {
        if (err) {
            console.log("Error en la subscripción");
        } else {
            console.log("Subscrito exitosamente");
        }
    });
});

client.on('message', function (topic, message) {
    try {
        let json1 = JSON.parse(message.toString());
        console.log(json1);
        let temperatura = json1.temperatura;
        let humedad = json1.Humedad;
        let json2;
        let json3;

        if (temperatura > 5) {
            json2 = { "estadotemp": "Temperatura Alta" };
        } else if (temperatura < 0) {
            json2 = { "estadotemp": "Temperatura Baja" };
        } else if (temperatura >= 0 && temperatura <= 5) {
            json2 = { "estadotemp": "Temperatura Optima" };
        }

        if (humedad > 50.0) {
            json3 = { "estadohumedad": "Humedad Alta" };
        } else if (humedad < 50.0) {
            json3 = { "estadohumedad": "Humedad Optima" };
        }

        // Publicar el estado de temperatura en otro tópico
        client.publish('TempCamion/01', JSON.stringify(json2));
        client.publish('HumedadCamion/01', JSON.stringify(json3));

        // Insertar datos en la tabla datos_temperatura de MySQL
        connection.getConnection(function (error, tempConn) {
            if (error) {
                console.log("Error en la conexión a MySQL:", error);
            } else {
                console.log('Conexión a MySQL correcta.');
                let estadoTemp = json2.estadotemp;
                let estadohumedad = json3.estadohumedad;
                tempConn.query('INSERT INTO datos_temperatura (Id_Camion, Temperatura, Estado, Fecha_Hora) VALUES (?, ?, ?, NOW())', [json1.ID_CAMION, temperatura, estadoTemp], function (error, result) {
                    if (error) {
                        console.log("Error al ejecutar el query:", error);
                    } else {
                        console.log("Datos almacenados en MySQL correctamente.");
                    }
                });
                tempConn.query('INSERT INTO datos_humedad (Id_Camion, Humedad, Estado, Fecha_Hora) VALUES (?, ?, ?, NOW())', [json1.ID_CAMION, humedad, estadohumedad], function (error, result) {
                    if (error) {
                        console.log("Error al ejecutar el query:", error);
                    } else {
                        tempConn.release();
                        console.log("Datos almacenados en MySQL correctamente.");
                    }
                });
            }
        });
    } catch (error) {
        console.error("Error al procesar mensaje MQTT:", error);
    }
});

// Iniciar el servidor después de la conexión MQTT
app.listen(app.get('port'), () => {
    console.log("Servidor funcionando en el puerto", app.get('port'));
});

