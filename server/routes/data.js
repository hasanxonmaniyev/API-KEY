const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// POST /api/data - Student creates an individual dynamic API record
router.post('/', dataController.createRecord);

// GET /api/data - List all generated dynamic data
router.get('/', dataController.getAllRecords);

// GET /api/data/:id - Access dynamic JSON response directly via Fetch API
router.get('/:id', dataController.getRecordById);

// PUT /api/data/:id - Update dynamic record data
router.put('/:id', dataController.updateRecord);

// DELETE /api/data/:id - Delete dynamic record
router.delete('/:id', dataController.deleteRecord);

module.exports = router;
