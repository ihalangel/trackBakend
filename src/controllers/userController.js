// src/controllers/userController.js
const { UserSchema } = require('../models/models');
const User = require('mongoose').model('User', UserSchema);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar usuario
exports.registerUser = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email ya registrado' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ nombre, email, passwordHash, rol });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email o contraseña incorrectos' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Email o contraseña incorrectos' });

    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, rol: user.rol, nombre: user.nombre });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los usuarios (ejemplo)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
