// // src/app.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const app = express();

// // Middlewares globales
// app.use(cors());
// app.use(express.json());

// // Importa routers de rutas (por ejemplo)
// const userRoutes = require('./routes/userRoutes');
// // agrega otras rutas similares

// app.use('/api/users', userRoutes);
// // app.use('/api/containers', containerRoutes); // Ejemplo

// app.get('/', (req, res) => {
//   res.json({ message: 'API Yarda funcionando 🚚' });
// });

// module.exports = app;


// const express = require('express');
// const app = express();
// const cors = require('cors');
// require('dotenv').config();

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
// }));

// app.use(cors());
// app.use(express.json());

// // Middleware para loguear cada petición debe ir antes de las rutas
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// const userRoutes = require('./routes/userRouters.js');
// const authRoutes = require('./routes/authRouters.js');
// const protectedRoutes = require('./routes/protectedRoutes.js');

// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/protected', protectedRoutes);

// app.get('/', (req, res) => {
//   res.send('API Yarda funcionando 🚀');
// });

// module.exports = app;





const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Middleware logging

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
const userRoutes = require('./routes/userRouters.js');
const authRoutes = require('./routes/authRouters.js');
const protectedRoutes = require('./routes/protectedRoutes.js');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

app.get('/', (req, res) => {
  res.send('API Yarda funcionando 🚀');
});

module.exports = app;
