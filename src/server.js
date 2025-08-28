// src/server.js
require('dotenv').config();
const app = require('./app');  // importa la configuración del app de express
const connectDB = require('./db');

connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
