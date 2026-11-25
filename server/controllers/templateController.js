const db = require('../config/db');

// Validation helper for template structure
function validateTemplate(body) {
  const errors = [];
  if (!body.name || String(body.name).trim() === '') {
    errors.push('Template name is required');
  }

  if (!Array.isArray(body.fields) || body.fields.length === 0) {
    errors.push('Template must have at least one custom field');
  } else {
    body.fields.forEach((field, index) => {
      if (!field.name || String(field.name).trim() === '') {
        errors.push(`Field #${index + 1} must have a title/name`);
      }
      if (!field.key || String(field.key).trim() === '') {
        errors.push(`Field #${index + 1} must have a valid key (JSON property name)`);
      }
      const allowedTypes = ['text', 'number', 'boolean', 'image', 'email', 'date', 'color', 'textarea', 'tags'];
      if (!allowedTypes.includes(field.type)) {
        errors.push(`Field #${index + 1} (${field.name || 'unnamed'}) type '${field.type}' is invalid. Allowed: ${allowedTypes.join(', ')}`);
      }
    });
  }

  return errors;
}

// GET /api/templates - Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const queryText = publishedOnly
      ? 'SELECT * FROM templates WHERE is_published = true ORDER BY id DESC'
      : 'SELECT * FROM templates ORDER BY id DESC';

    const result = await db.query(queryText);
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('getAllTemplates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve templates', error: err.message });
  }
};

// GET /api/templates/:id - Get template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const result = await db.query('SELECT * FROM templates WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Template with ID ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('getTemplateById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve template', error: err.message });
  }
};

// POST /api/templates - Admin creates a new dynamic template
exports.createTemplate = async (req, res) => {
  try {
    const errors = validateTemplate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const { name, description = '', fields, is_published = true } = req.body;

    // Sanitize fields
    const sanitizedFields = fields.map((f, i) => ({
      id: f.id || f.key || `field_${i + 1}`,
      key: (f.key || f.name).replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, ''),
      name: String(f.name).trim(),
      type: f.type,
      required: Boolean(f.required),
      defaultValue: f.defaultValue !== undefined ? f.defaultValue : ''
    }));

    const result = await db.query(
      `INSERT INTO templates (name, description, fields, is_published)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), description.trim(), JSON.stringify(sanitizedFields), is_published]
    );

    return res.status(201).json({
      success: true,
      message: 'Dynamic template created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('createTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create template', error: err.message });
  }
};

// PUT /api/templates/:id - Admin updates a template (fields, ordering, types, publish status)
exports.updateTemplate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const existing = await db.query('SELECT * FROM templates WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Template with ID ${id} not found` });
    }

    const errors = validateTemplate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const { name, description = '', fields, is_published = true } = req.body;

    const sanitizedFields = fields.map((f, i) => ({
      id: f.id || f.key || `field_${i + 1}`,
      key: (f.key || f.name).replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, ''),
      name: String(f.name).trim(),
      type: f.type,
      required: Boolean(f.required),
      defaultValue: f.defaultValue !== undefined ? f.defaultValue : ''
    }));

    const result = await db.query(
      `UPDATE templates
       SET name = $1, description = $2, fields = $3, is_published = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name.trim(), description.trim(), JSON.stringify(sanitizedFields), is_published, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('updateTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update template', error: err.message });
  }
};

// DELETE /api/templates/:id - Admin deletes a template
exports.deleteTemplate = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid template ID' });
    }

    const result = await db.query('DELETE FROM templates WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Template with ID ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      message: `Template #${id} and associated records were deleted.`
    });
  } catch (err) {
    console.error('deleteTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete template', error: err.message });
  }
};
