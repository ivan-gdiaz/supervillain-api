// Envuelve un handler async (o un router.param): si falla, el error pasa al manejador de errores de app.js
module.exports = (fn) => (...args) => Promise.resolve(fn(...args)).catch(args[2]);
