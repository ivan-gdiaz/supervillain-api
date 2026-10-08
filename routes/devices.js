const express = require('express');
const router = express.Router({ mergeParams: true });
const Device = require('../models/Device');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['name', 'status', 'power'];

// Carga la máquina y comprueba que pertenece a la guarida de la ruta
router.param('deviceId', asyncHandler(async (req, res, next, id) => {
  req.device = await Device.findOne({ _id: id, lair: req.lair._id });
  if (!req.device) throw httpError(404, "Máquina no encontrada.");
  next();
}));

// GET: /villains/:villainId/lairs/:lairId/devices
router.get('/', asyncHandler(async (req, res) => {
  const devices = await Device.find({ lair: req.lair._id });
  res.json({ message: "Armamento preparado", data: devices });
}));

// POST: construir una nueva máquina del juicio final
router.post('/', asyncHandler(async (req, res) => {
  const device = await Device.create({ ...pick(req.body, FIELDS), lair: req.lair._id });
  res.status(201).json({ message: "Nueva máquina del juicio final en construcción.", data: device });
}));

// GET: una máquina concreta
router.get('/:deviceId', (req, res) => {
  res.json(req.device);
});

// PUT: recalibrar una máquina
router.put('/:deviceId', asyncHandler(async (req, res) => {
  req.device.set(pick(req.body, FIELDS));
  await req.device.save();
  res.json({ message: "Máquina recalibrada.", data: req.device });
}));

// DELETE: desmantelar una máquina
router.delete('/:deviceId', asyncHandler(async (req, res) => {
  await req.device.deleteOne();
  res.json({ message: "Máquina desmantelada. Qué pena." });
}));

module.exports = router;
