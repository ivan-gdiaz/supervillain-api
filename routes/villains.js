const express = require('express');
const router = express.Router();
const Villain = require('../models/Villain');
const Lair = require('../models/Lair');
const Minion = require('../models/Minion');
const Device = require('../models/Device');
const lairsRouter = require('./lairs');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['name', 'alias', 'evilLevel'];

// Carga el villano de la URL: 404 si no existe, 400 si el id no es válido
router.param('villainId', asyncHandler(async (req, res, next, id) => {
  req.villain = await Villain.findById(id);
  if (!req.villain) throw httpError(404, "Villano no encontrado o está en la cárcel");
  next();
}));

// Delegamos /:villainId/lairs al router de guaridas
router.use('/:villainId/lairs', lairsRouter);

// GET: listar todos los villanos
router.get('/', asyncHandler(async (req, res) => {
  const villains = await Villain.find();
  res.json({ message: "Sindicato del mal cargado", data: villains });
}));

// POST: contratar un nuevo villano
router.post('/', asyncHandler(async (req, res) => {
  const villain = await Villain.create(pick(req.body, FIELDS));
  res.status(201).json({ message: "Nuevo villano registrado. El mundo tiembla.", data: villain });
}));

// GET: obtener un villano específico
router.get('/:villainId', (req, res) => {
  res.json(req.villain);
});

// PUT: modificar un villano
router.put('/:villainId', asyncHandler(async (req, res) => {
  req.villain.set(pick(req.body, FIELDS));
  await req.villain.save();
  res.json({ message: "Villano actualizado. Sus planes siguen en marcha.", data: req.villain });
}));

// DELETE: dar de baja a un villano y a todo lo que cuelga de él
router.delete('/:villainId', asyncHandler(async (req, res) => {
  const lairIds = (await Lair.find({ villain: req.villain._id }).select('_id')).map((l) => l._id);
  await Minion.deleteMany({ lair: { $in: lairIds } });
  await Device.deleteMany({ lair: { $in: lairIds } });
  await Lair.deleteMany({ villain: req.villain._id });
  await req.villain.deleteOne();
  res.json({ message: "Villano capturado. Sus guaridas, esbirros y máquinas, desmantelados." });
}));

module.exports = router;
