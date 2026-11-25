const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// GET /api/templates - Get all templates
router.get('/', templateController.getAllTemplates);

// GET /api/templates/:id - Get template by ID
router.get('/:id', templateController.getTemplateById);

// POST /api/templates - Admin creates a new dynamic template
router.post('/', templateController.createTemplate);

// PUT /api/templates/:id - Admin updates a template
router.put('/:id', templateController.updateTemplate);

// DELETE /api/templates/:id - Admin deletes a template
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;
