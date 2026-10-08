const express = require('express');
// mergeParams es OBLIGATORIO para leer req.params.villainId del router padre
const router = express.Router({ mergeParams: true });
const Lair = require('../models/Lair');
const Minion = require('../models/Minion');
const Device = require('../models/Device');
const minionsRouter = require('./minions');
const devicesRouter = require('./devices');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['name', 'location'];

// Carga la guarida de la URL y comprueba que pertenece al villano de la ruta
router.param('lairId', asyncHandler(async (req, res, next, id) => {
  req.lair = await Lair.findOne({ _id: id, villain: req.villain._id });
  if (!req.lair) throw httpError(404, "Guarida no encontrada");
  next();
}));

// Anidación de 3er nivel: esbirros y máquinas dentro de una guarida
router.use('/:lairId/minions', minionsRouter);
router.use('/:lairId/devices', devicesRouter);

// GET: listar guaridas de un villano específico
router.get('/', asyncHandler(async (req, res) => {
  const lairs = await Lair.find({ villain: req.villain._id });
  res.json({ message: `Guaridas del villano ${req.villain.name}`, data: lairs });
}));

// POST: construir nueva guarida (el villano sale de la URL, no del cuerpo)
router.post('/', asyncHandler(async (req, res) => {
  const lair = await Lair.create({ ...pick(req.body, FIELDS), villain: req.villain._id });
  res.status(201).json({ message: "Nueva guarida secreta construida. Shhh.", data: lair });
}));

// GET: una guarida, con los datos de su villano
router.get('/:lairId', asyncHandler(async (req, res) => {
  await req.lair.populate('villain');
  res.json(req.lair);
}));

// PUT: reformar una guarida
router.put('/:lairId', asyncHandler(async (req, res) => {
  req.lair.set(pick(req.body, FIELDS));
  await req.lair.save();
  res.json({ message: "Guarida reformada. Ahora con más trampillas.", data: req.lair });
}));

// DELETE: demoler una guarida con sus esbirros y máquinas
router.delete('/:lairId', asyncHandler(async (req, res) => {
  await Minion.deleteMany({ lair: req.lair._id });
  await Device.deleteMany({ lair: req.lair._id });
  await req.lair.deleteOne();
  res.json({ message: "Guarida demolida. Solo quedan cenizas." });
}));

module.exports = router;
