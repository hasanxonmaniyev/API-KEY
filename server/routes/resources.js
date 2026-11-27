const express = require('express');
const c = require('../controllers/resourceController');

// Boshqaruv: /api/resources (sayt shu orqali yaratadi va tahrirlaydi)
const manage = express.Router();
manage.get('/', c.list);
manage.post('/', c.create);
manage.get('/:slug', c.get);
manage.put('/:slug', c.replace);
manage.delete('/:slug', c.remove);

// Ommaviy: /api/:slug — toza JSON (JSONPlaceholder uslubida)
const publicApi = express.Router();
publicApi.get('/:slug', c.publicList);
publicApi.post('/:slug', c.publicCreate);
publicApi.get('/:slug/:id', c.publicGet);
publicApi.put('/:slug/:id', c.publicReplace);
publicApi.patch('/:slug/:id', c.publicPatch);
publicApi.delete('/:slug/:id', c.publicDelete);

module.exports = { manage, publicApi };
