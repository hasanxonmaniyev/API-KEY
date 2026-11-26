const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

// Kolleksiyalar ro'yxati va yaratish
router.get('/', collectionController.getAllCollections);
router.post('/', collectionController.createCollection);

// Bitta kolleksiyani olish va o'chirish (o'quvchilar fetch qiladigan asosiy endpoint)
router.get('/:idOrSlug', collectionController.getCollection);
router.delete('/:idOrSlug', collectionController.deleteCollection);

// Kolleksiya ichidagi elementlar (Talaba uchun to'liq CRUD: "+ Yangi o'quvchi", "Batafsil ->", tahrirlash, o'chirish)
router.post('/:idOrSlug/items', collectionController.addItem);
router.get('/:idOrSlug/items/:itemId', collectionController.getItem);
router.put('/:idOrSlug/items/:itemId', collectionController.updateItem);
router.delete('/:idOrSlug/items/:itemId', collectionController.deleteItem);

// Bitta elementni to'g'ridan-to'g'ri olish: /api/collections/oquvchilar/1 (jsonplaceholder uslubida)
router.get('/:idOrSlug/:itemId', collectionController.getItem);
router.put('/:idOrSlug/:itemId', collectionController.updateItem);
router.delete('/:idOrSlug/:itemId', collectionController.deleteItem);

module.exports = router;
