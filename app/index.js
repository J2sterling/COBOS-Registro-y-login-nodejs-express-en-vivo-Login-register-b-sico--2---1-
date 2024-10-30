import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";
import cookieParser from 'cookie-parser';
import session from "express-session";
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from "crypto";
import { methods as authentication } from "./controllers/authentication.controller.js";
import { methods as authorization } from "./middlewares/authorization.js";

// Fix para __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Configuración de la base de datos
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'evalua_kids'
});

// Inicializa el servidor
const app = express();
app.set("port", 4000);

// Configuración de la sesión
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // `secure: true` solo si usas HTTPS
}));

// Middlewares adicionales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Rutas de autenticación y páginas
app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", authorization.soloPublico, (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/login.html"));
});

app.get("/register", authorization.soloPublico, (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/register.html"));
});

app.get("/admin", authorization.soloAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/admin.html"));
});

// Ruta para el formulario de añadir educador
app.get("/admin/anadir-educador", authorization.soloAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/anadirEducador.html"));
});

// **Nueva ruta para AgregarNi.html**
app.get("/admin/agregar-ni", authorization.soloAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/AgregarNi.html"));
});


app.get("/admin/mas-informacion", (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/MasInformacion.html"));
});

app.get("/admin/agenda-actividades", (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/AgendaActividades.html"));
});

app.get("/admin/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/admin.html"));
});
// Ruta para la página de Caso
app.get("/admin/caso", authorization.soloAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "/pages/admin/Caso.html"));
});



app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);

// Ruta para el cierre de sesión
app.post('/api/logout', (req, res) => { 
    console.log("Cierre de sesión solicitado"); // Confirmación en la consola del servidor
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send({ message: "Error al cerrar sesión" });
        }
        res.clearCookie('connect.sid'); // Limpia la cookie de sesión
        return res.status(200).send({ redirect: "/" });
    });
});


// Ruta para recibir el formulario de creación de educador y guardar en la base de datos
app.post('/agregar-educador', authorization.soloAdmin, upload.single('archivo'), async (req, res) => {
    try {
        const educador_id = crypto.randomUUID();
        const { nombre, documento, correo } = req.body;
        const archivo = req.file ? req.file.filename : null;

        const query = 'INSERT INTO educadores (educador_id, nombre, documento, correo, foto) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [educador_id, nombre, documento, correo, archivo]);

        res.send("Educador agregado exitosamente.");
    } catch (err) {
        console.error('Error al agregar el educador a la base de datos:', err);
        res.status(500).send('Error al crear el educador');
    }
});

app.get('/api/educadores', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT educador_id, nombre FROM educadores');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los educadores:', error);
        res.status(500).json({ message: 'Error al obtener los educadores' });
    }
});


app.post('/api/agregar-caso', upload.fields([{ name: 'imagen_estudiante' }, { name: 'imagen_acudiente' }]), async (req, res) => {
    try {
        const caso_id = crypto.randomUUID();

        const { nombre_nino, edad, nombre_acudiente, correo_acudiente, educador_id } = req.body;
        const imagen_estudiante = req.files['imagen_estudiante'] ? req.files['imagen_estudiante'][0].filename : null;
        const imagen_acudiente = req.files['imagen_acudiente'] ? req.files['imagen_acudiente'][0].filename : null;

        console.log("Datos recibidos para inserción:", { caso_id, nombre_nino, edad, nombre_acudiente, correo_acudiente, educador_id, imagen_estudiante, imagen_acudiente });

        const query = `
            INSERT INTO casos (caso_id, nombre_nino, edad, nombre_acudiente, correo_acudiente, educador_id, imagen_estudiante, imagen_acudiente)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            caso_id,
            nombre_nino,
            edad,
            nombre_acudiente,
            correo_acudiente,
            educador_id, // Aquí usamos el educador_id que llega desde el formulario
            imagen_estudiante,
            imagen_acudiente
        ]);

        res.status(201).send({ message: "Caso agregado exitosamente" });
    } catch (err) {
        console.error('Error al agregar el caso:', err);
        res.status(500).send({ message: "Error al agregar el caso" });
    }
});
// Ruta para recibir y guardar un nuevo caso en casos2
app.post('/api/agregar-caso2', upload.fields([{ name: 'archivo_1' }, { name: 'archivo_2' }]), async (req, res) => {
    try {
        const caso_id = req.body.caso_id || crypto.randomUUID();  // Usa el ID proporcionado o crea uno nuevo
        const nombre_caso = req.body.nombre_caso || "Nombre del caso"; // Ajusta según lo que recibas del frontend
        const descripcion = req.body.descripcion || "Descripción del caso";
        const actividad_estado = req.body.actividad_estado || "Sin realizar";
        const actividad_descripcion = req.body.actividad_descripcion || "Descripción de la actividad";
        const habilidad_interpersonal = req.body.habilidad_interpersonal ? 1 : 0;
        const habilidad_linguistica = req.body.habilidad_linguistica ? 1 : 0;
        const recursos_necesarios = req.body.recursos_necesarios || "";

        const archivo_1 = req.files['archivo_1'] ? req.files['archivo_1'][0].filename : null;
        const archivo_2 = req.files['archivo_2'] ? req.files['archivo_2'][0].filename : null;

        const query = `
            INSERT INTO casos2 (
                caso_id, nombre_caso, descripcion, actividad_estado, actividad_descripcion, 
                habilidad_interpersonal, habilidad_linguistica, recursos_necesarios, 
                archivo_1, archivo_2
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            caso_id,
            nombre_caso,
            descripcion,
            actividad_estado,
            actividad_descripcion,
            habilidad_interpersonal,
            habilidad_linguistica,
            recursos_necesarios,
            archivo_1,
            archivo_2
        ]);

        res.status(201).send({ message: "Caso agregado exitosamente en casos2" });
    } catch (err) {
        console.error('Error al agregar el caso en casos2:', err);
        res.status(500).send({ message: "Error al agregar el caso en casos2" });
    }
});



// Iniciar servidor
app.listen(app.get("port"), () => {
    console.log("Servidor corriendo en puerto", app.get("port"));
});









