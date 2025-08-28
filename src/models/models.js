// src/models.js
const mongoose = require('mongoose');

// Esquema Usuarios (Users)
const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  rol: { type: String, enum: ['driver', 'comprobador', 'master', 'super-admin'], required: true },
  creditos: { type: Number, default: 0 }, // Solo masters tienen créditos
  yardasAsignadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Yarda' }], // Comprobadores asignados a yardas
  fechaCreacion: { type: Date, default: Date.now },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  referidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

// Esquema Yardas (Yardas)
const YardaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  masterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ubicacion: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitud, latitud]
  },
  radioGeografico: { type: Number, required: true }, // metros
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  fechaCreacion: { type: Date, default: Date.now }
});
YardaSchema.index({ ubicacion: '2dsphere' });

// Esquema base Unidades de Carga (Carga) con discriminadores
const optionsCarga = { discriminatorKey: 'tipoCarga', collection: 'cargas' };
const CargaSchema = new mongoose.Schema({
  codigoUnidad: { type: String, unique: true, required: true },
  estado: { type: String, enum: ['pendiente', 'registrado', 'validado', 'salidaRegistrada'], default: 'pendiente' },
  ubicacionActual: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  historialEstados: [{
    fecha: Date,
    estado: String,
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  fechaCreacion: { type: Date, default: Date.now }
}, optionsCarga);

const Carga = mongoose.model('Carga', CargaSchema);

// Discriminador para tipo "Completa"
const CompletaSchema = new mongoose.Schema({
  detallesCompleta: {
    tipoTrailer: String,
    detallesContenedor: {
      tipo: String,
      dimensiones: String,
      pesoMaximo: Number
    },
    detallesChassis: {
      tipo: String,
      capacidadPeso: Number
    }
  }
});
const Completa = Carga.discriminator('Completa', CompletaSchema);

// Discriminador para tipo "Trailer" y "BoxTruck"
const VehiculoSchema = new mongoose.Schema({
  detallesVehiculo: {
    marca: String,
    modelo: String,
    ano: Number,
    capacidadCarga: Number
  }
});
const Trailer = Carga.discriminator('Trailer', VehiculoSchema);
const BoxTruck = Carga.discriminator('BoxTruck', VehiculoSchema);

// Otros tipos pueden agregarse de forma similar

// Esquema Registro
const RegistroSchema = new mongoose.Schema({
  cargaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carga', required: true },
  yardaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Yarda', required: true },
  tipoRegistro: { type: String, enum: ['entrada', 'salida'], required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fechaRegistro: { type: Date, default: Date.now },
  ubicacionRegistro: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  estadoValidacion: { type: String, enum: ['pendiente', 'validado', 'rechazado'], default: 'pendiente' },
  notas: String,
  creditosConsumidos: Number,
  validaciones: [{
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resultado: { type: String, enum: ['aprobado', 'rechazado'] },
    fecha: Date,
    comentarios: String
  }]
});
RegistroSchema.index({ ubicacionRegistro: '2dsphere' });
const Registro = mongoose.model('Registro', RegistroSchema);

// Esquema Transacciones de Créditos
const TransaccionCreditoSchema = new mongoose.Schema({
  masterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  yardaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Yarda' },
  tipoTransaccion: { type: String, enum: ['recarga', 'consumo'], required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  referencia: String
});
const TransaccionCredito = mongoose.model('TransaccionCredito', TransaccionCreditoSchema);

/* 
Flujos Críticos:
1. Registro de Carga (Driver)
 - Driver registra entrada o salida junto a la unidad de carga.
 - Ingresa ubicación GPS, tipo de registro (entrada o salida).
 - Estado de registro inicial es 'pendiente'.
 - No consume crédito aún.
2. Validación (Comprobadores / Master)
 - Comprobadores asignados a la yarda validan las entradas/salidas.
 - Master también puede validar.
 - Cada validación aprobada genera consumo de créditos en el master dueño de la yarda.
 - Estado del registro cambia según reglas (ej. validado si al menos un aprobado).
 - Registro de validaciones con usuario, fecha y comentarios para trazabilidad.
3. Créditos
 - Solo el master puede recargar créditos (transacciones tipo 'recarga').
 - Consumo de créditos se registra por validaciones aprobadas (tipo 'consumo').
 - Reportes y auditorías basados en movimientos de créditos.
*/

module.exports = {
  UserSchema,
  YardaSchema,
  Carga,
  Completa,
  Trailer,
  BoxTruck,
  Registro,
  TransaccionCredito
};
