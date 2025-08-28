const { UserSchema } = require('../models/models');
const User = require('mongoose').model('User', UserSchema);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario
exports.register = async (req, res) => {
    console.log('Petición POST a /api/auth/register recibida con body:', req.body);
  try {
    const { nombre, email, password, rol, telefono } = req.body;

    // Validación simple email o teléfono
    if (!email && !telefono) {
      return res.status(400).json({ message: 'Debe proporcionar email o teléfono' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email ya registrado' });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      email,
      passwordHash,
      rol,
      // Puedes agregar telefono al schema y aquí si usas
    });

    await newUser.save();

    return res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login usuario y retorno JWT
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email y password son requeridos' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    // Generar token JWT con id y rol del usuario
    const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



exports.login = async (req, res) => {
  try {
     const { loginValue, password } = req.body;
    if (!loginValue || !password)
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    
     const user = await User.findOne({
      $or: [
        { email: loginValue },
        { nombre: loginValue }
      ]
    });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });
      const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

     const token = jwt.sign(
      { id: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
