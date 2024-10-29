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
    secret: 'tuSecreto', // Cambia este secreto por uno seguro
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Cambia a `true` si estás en producción con HTTPS
        maxAge: 3600000 // 1 hora
    }
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

app.post("/api/login", authentication.login);
app.post("/api/register", authentication.register);

// Ruta para el cierre de sesión
app.post('/api/logout', (req, res) => { 
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).send({ message: "Error al cerrar sesión" });
        }
        res.clearCookie('connect.sid'); // Nombre de la cookie por defecto de express-session
        return res.status(200).send({ redirect: "/login" });
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

// Ruta para agregar caso a la base de datos
app.post('/api/agregar-ni', async (req, res) => {
    try {
        const { nombreNino, edad, nombreAcudiente, correoAcudiente } = req.body;

        const query = `INSERT INTO casos (nombre_nino, edad, nombre_acudiente, correo_acudiente) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [nombreNino, edad, nombreAcudiente, correoAcudiente]);

        res.status(200).json({ message: "Caso agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar el caso:", error);
        res.status(500).json({ message: "Error al agregar el caso" });
    }
});


// Iniciar servidor
app.listen(app.get("port"), () => {
    console.log("Servidor corriendo en puerto", app.get("port"));
});









