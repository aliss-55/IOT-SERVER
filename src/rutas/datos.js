const { Router } = require('express');
const router = Router();
const mysql = require('mysql');
const moment = require('moment'); // Importar moment.js

// Se crea la conexión a MySQL
const connection = mysql.createPool({
    connectionLimit: 500,
    host: 'localhost',
    user: 'root',
    password: '', // Contraseña de MySQL
    database: 'TransporteAlimentos',
    port: 3306
});

// Ruta para obtener todos los datos de temperatura y humedad
router.get('/datos', (req, res) => {
    connection.getConnection(function (error, tempConn) {
        if (error) {
            console.error("Error en la conexión a MySQL:", error);
            res.status(500).send("Error en la conexión a MySQL");
        } else {
            console.log('Conexión a MySQL correcta.');

            // Consulta para obtener todos los datos de temperatura y humedad
            var query = `
                SELECT dt.Id_Camion, dt.Temperatura, dt.Estado AS Estado_Temperatura,
                       dh.Humedad, dh.Estado AS Estado_Humedad, dt.Fecha_Hora
                FROM datos_temperatura dt
                INNER JOIN datos_humedad dh ON dt.Id_Camion = dh.Id_Camion
            `;

            tempConn.query(query, function (error, result) {
                if (error) {
                    console.error("Error al ejecutar la consulta:", error);
                    res.status(500).send("Error al ejecutar la consulta");
                } else {
                    console.log("Consulta ejecutada correctamente:", result);

                    // Iterar sobre cada resultado y formatear la fecha y hora usando moment.js
                    result.forEach(item => {
                        item.Fecha_Hora = moment(item.Fecha_Hora).format('YYYY-MM-DD HH:mm:ss');
                    });

                    res.json(result); // Enviar el resultado como respuesta JSON
                }
                tempConn.release(); // Liberar la conexión
            });
        }
    });
});


// Ruta para obtener datos por ID_CAMION
router.get('/datos/:id_camion', (req, res) => {
    const id_camion = req.params.id_camion;

    connection.getConnection(function (error, tempConn) {
        if (error) {
            console.error("Error en la conexión a MySQL:", error);
            res.status(500).send("Error en la conexión a MySQL");
        } else {
            console.log('Conexión a MySQL correcta.');

            // Consulta para obtener datos de temperatura y humedad por ID_CAMION
            var query = `
                SELECT dt.Id_Camion, dt.Temperatura, dt.Estado AS Estado_Temperatura,
                       dh.Humedad, dh.Estado AS Estado_Humedad, dt.Fecha_Hora
                FROM datos_temperatura dt
                INNER JOIN datos_humedad dh ON dt.Id_Camion = dh.Id_Camion
                WHERE dt.Id_Camion = ?
            `;

            tempConn.query(query, [id_camion], function (error, result) {
                if (error) {
                    console.error("Error al ejecutar la consulta:", error);
                    res.status(500).send("Error al ejecutar la consulta");
                } else {
                    console.log("Consulta ejecutada correctamente:", result);

                    // Iterar sobre cada resultado y formatear la fecha y hora usando moment.js
                    result.forEach(item => {
                        item.Fecha_Hora = moment(item.Fecha_Hora).format('YYYY-MM-DD HH:mm:ss');
                    });

                    res.json(result); // Enviar el resultado como respuesta JSON
                }
                tempConn.release(); // Liberar la conexión
            });
        }
    });
});

/* Ruta para actualizar datos por ID_CAMION
router.put('/datos/:id_camion', (req, res) => {
    const id_camion = req.params.id_camion;
    const newData = req.body; // Datos actualizados recibidos en el cuerpo de la solicitud

    connection.getConnection(function (error, tempConn) {
        if (error) {
            console.error("Error en la conexión a MySQL:", error);
            res.status(500).send("Error en la conexión a MySQL");
        } else {
            console.log('Conexión a MySQL correcta.');

            // Consulta para actualizar datos de temperatura y humedad por ID_CAMION
            var query = `
                UPDATE datos_temperatura dt
                INNER JOIN datos_humedad dh ON dt.Id_Camion = dh.Id_Camion
                SET dt.Temperatura = ?, dt.Estado = ?,
                    dh.Humedad = ?, dh.Estado = ?
                WHERE dt.Id_Camion = ?
            `;

            const { temperatura, estadoTemperatura, humedad, estadoHumedad } = newData;
            const params = [temperatura, estadoTemperatura, humedad, estadoHumedad, id_camion];

            tempConn.query(query, params, function (error, result) {
                if (error) {
                    console.error("Error al ejecutar la consulta:", error);
                    res.status(500).send("Error al ejecutar la consulta");
                } else {
                    console.log("Datos actualizados correctamente.");
                    res.send("Datos actualizados correctamente");
                }
                tempConn.release(); // Liberar la conexión
            });
        }
    });
});

// Ruta para eliminar datos por ID_CAMION
router.delete('/datos/:id_camion', (req, res) => {
    const id_camion = req.params.id_camion;

    connection.getConnection(function (error, tempConn) {
        if (error) {
            console.error("Error en la conexión a MySQL:", error);
            res.status(500).send("Error en la conexión a MySQL");
        } else {
            console.log('Conexión a MySQL correcta.');

            // Consulta para eliminar datos de temperatura y humedad por ID_CAMION
            var query = `
                DELETE FROM datos_temperatura WHERE Id_Camion = ?
            `;

            tempConn.query(query, [id_camion], function (error, result) {
                if (error) {
                    console.error("Error al ejecutar la consulta:", error);
                    res.status(500).send("Error al ejecutar la consulta");
                } else {
                    console.log("Datos eliminados correctamente.");
                    res.send("Datos eliminados correctamente");
                }
                tempConn.release(); // Liberar la conexión
            });
        }
    });
});*/

module.exports = router;


