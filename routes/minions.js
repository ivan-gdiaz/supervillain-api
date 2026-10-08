const express = require('express');
const router = express.Router({ mergeParams: true });
const Minion = require('../models/Minion');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const pick = require('../utils/pick');

const FIELDS = ['name', 'eyeCount', 'expendable'];

// Carga el esbirro y comprueba que pertenece a la guarida de la ruta
router.param('minionId', asyncHandler(async (req, res, next, id) => {
  req.minion = await Minion.findOne({ _id: id, lair: req.lair._id });
  if (!req.minion) throw httpError(404, "Esbirro no encontrado.");
  next();
}));

// GET: /villains/:villainId/lairs/:lairId/minions
router.get('/', asyncHandler(async (req, res) => {
  const minions = await Minion.find({ lair: req.lair._id });
  res.json({ data: minions });
}));

// POST: reclutar a un esbirro
router.post('/', asyncHandler(async (req, res) => {
  const minion = await Minion.create({ ...pick(req.body, FIELDS), lair: req.lair._id });
  res.status(201).json({ message: "Nuevo esbirro reclutado. Dice «¡Bello!».", data: minion });
}));

// GET: un esbirro concreto
router.get('/:minionId', (req, res) => {
  res.json(req.minion);
});

// PUT: ascender o modificar a un esbirro
router.put('/:minionId', asyncHandler(async (req, res) => {
  req.minion.set(pick(req.body, FIELDS));
  await req.minion.save();
  res.json({ message: "Esbirro modificado genéticamente con éxito.", data: req.minion });
}));

// DELETE: despedir a un esbirro
router.delete('/:minionId', asyncHandler(async (req, res) => {
  await req.minion.deleteOne();
  res.json({ message: "Esbirro lanzado al foso de los cocodrilos exitosamente." });
}));

module.exports = router;
