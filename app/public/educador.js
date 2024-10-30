const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 4000;

// Configuración de la base de datos usando Pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'evalua_kids'
});

// Configuración de Multer para manejar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware para analizar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Ruta para recibir el formulario de creación de educador y guardar en la base de datos
app.post('/agregar-educador', upload.single('archivo'), async (req, res) => {
    try {
        // Genera el UUID utilizando crypto
        const educador_id = crypto.randomUUID();
        console.log("UUID generado:", educador_id); // Log para confirmar el UUID generado

        // Extrae los datos del formulario
        const { nombre, documento, correo } = req.body;
        const archivo = req.file ? req.file.filename : null; // Nombre del archivo si existe

        console.log("Datos recibidos para inserción:", { educador_id, nombre, documento, correo, archivo });

        // Inserta los datos en la base de datos, incluyendo el UUID como `educador_id`
        const query = 'INSERT INTO educadores (educador_id, nombre, documento, correo, foto) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [educador_id, nombre, documento, correo, archivo]);

        console.log("Resultado de la inserción:", result); // Log para verificar la inserción
        res.send("Educador agregado exitosamente.");
    } catch (err) {
        console.error('Error al agregar el educador a la base de datos:', err);
        res.status(500).send('Error al crear el educador');
    }
});

// Servir el formulario de prueba
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/admin/anadirEducador.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




