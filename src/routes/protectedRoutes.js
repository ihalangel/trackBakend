// src/routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');

// Ejemplo ruta protegida que puede ser usada para un dashboard o información sensible
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Bienvenido al dashboard seguro, usuario: ${req.user.id}`,
    rol: req.user.rol
  });
});

// Puedes agregar más rutas protegidas aquí
// router.post('/registro', verifyToken, registroController.createRegistro);
// router.get('/registros', verifyToken, registroController.getRegistros);

module.exports = router;
