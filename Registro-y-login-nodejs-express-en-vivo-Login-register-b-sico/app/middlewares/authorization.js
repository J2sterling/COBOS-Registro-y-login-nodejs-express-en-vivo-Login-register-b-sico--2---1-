import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { usuarios } from "./../controllers/authentication.controller.js";

dotenv.config();

function soloAdmin(req, res, next) {
    const logueado = revisarCookie(req);
    if (logueado) return next();
    return res.redirect("/login"); // Redirige a login si no está autenticado
}

function soloPublico(req, res, next) {
    const logueado = revisarCookie(req);
    if (!logueado) return next();
    return res.redirect("/admin"); // Redirige a admin si ya está autenticado
}

function revisarCookie(req) {
    try {
        // Extrae la cookie "jwt"
        const cookieJWT = req.headers.cookie
            ?.split("; ")
            .find(cookie => cookie.startsWith("jwt="))
            ?.slice(4);

        if (!cookieJWT) {
            console.log("No se encontró la cookie JWT.");
            return false;
        }

        // Verifica y decodifica el token JWT
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.JWT_SECRET);
        console.log("Token decodificado:", decodificada);

        // Verifica que el usuario decodificado existe en la lista de usuarios
        const usuarioAResvisar = usuarios.find(usuario => usuario.user === decodificada.user);
        console.log("Usuario encontrado:", usuarioAResvisar);

        return !!usuarioAResvisar; // Devuelve true si el usuario es válido, false en caso contrario
    } catch (error) {
        console.error("Error al verificar la cookie JWT:", error);
        return false;
    }
}

export const methods = {
    soloAdmin,
    soloPublico,
};
