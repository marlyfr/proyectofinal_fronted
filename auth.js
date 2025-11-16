import pool from "./db.js";
import bcrypt from "bcryptjs";
import generateToken from "./generateToken.js"; // ← CORRECTO, SIN CARPETAS

// ============================
// REGISTRO
// ============================
export const register = async (req, res) => {
  const { NombreCompleto, Usuario, Correo, password, IdRol } = req.body;

  if (!NombreCompleto || !Usuario || !Correo || !password || !IdRol) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    const checkUser = await pool.query(
      `SELECT * FROM usuarios WHERE usuario = $1`,
      [Usuario]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO usuarios (nombrecompleto, usuario, correo, contrasenahash, idrol)
       VALUES ($1,$2,$3,$4,$5)`,
      [NombreCompleto, Usuario, Correo, hash, IdRol]
    );

    return res.json({ message: "Usuario registrado correctamente" });

  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

// ============================
// LOGIN
// ============================
export const login = async (req, res) => {
  const { Usuario, password } = req.body;

  if (!Usuario || !password) {
    return res.status(400).json({ message: "Usuario y contraseña son obligatorios" });
  }

  try {
    const result = await pool.query(
      `SELECT idusuario, nombrecompleto, usuario, correo, contrasenahash, idrol
       FROM usuarios
       WHERE usuario = $1`,
      [Usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.contrasenahash);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login exitoso",
      token,
      user
    });

  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
