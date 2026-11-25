const db = require('../config/db');

// Helper to validate and cast dynamic record data based on template definition
function validateAndCastData(templateFields, inputData) {
  const errors = [];
  const sanitized = {};

  for (const field of templateFields) {
    const key = field.key;
    const value = inputData[key];
    const isRequired = field.required;

    // Check required
    if (isRequired && (value === undefined || value === null || String(value).trim() === '')) {
      errors.push(`Field '${field.name}' (${key}) is required`);
      continue;
    }

    if (value === undefined || value === null) {
      if (field.defaultValue !== undefined && field.defaultValue !== '') {
        sanitized[key] = field.defaultValue;
      }
      continue;
    }

    // Type casting and validation
    switch (field.type) {
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`Field '${field.name}' must be a valid number`);
        } else {
          sanitized[key] = num;
        }
        break;
      }
      case 'boolean': {
        if (typeof value === 'boolean') {
          sanitized[key] = value;
        } else if (value === 'true' || value === 1 || value === '1') {
          sanitized[key] = true;
        } else if (value === 'false' || value === 0 || value === '0') {
          sanitized[key] = false;
        } else {
          errors.push(`Field '${field.name}' must be a boolean (true or false)`);
        }
        break;
      }
      case 'text':
      default: {
        sanitized[key] = String(value);
        break;
      }
    }
  }

  // Also retain any other properties submitted by student
  for (const [k, v] of Object.entries(inputData)) {
    if (k !== 'templateId' && sanitized[k] === undefined) {
      sanitized[k] = v;
    }
  }

  return { errors, sanitized };
}

// POST /api/data - Student creates an individual dynamic API record
exports.createRecord = async (req, res) => {
  try {
    const templateId = req.body.templateId || req.body.template_id;
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'templateId is required to generate dynamic API endpoint'
      });
    }

    // Retrieve template definition
    const tplResult = await db.query('SELECT * FROM templates WHERE id = $1', [Number(templateId)]);
    if (tplResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Template #${templateId} not found`
      });
    }

    const template = tplResult.rows[0];
    const fields = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields;

    // The data might be inside req.body.data or directly in req.body
    const rawData = req.body.data && typeof req.body.data === 'object' ? req.body.data : req.body;

    const { errors, sanitized } = validateAndCastData(fields, rawData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed against template fields',
        errors
      });
    }

    const result = await db.query(
      `INSERT INTO records (template_id, data)
       VALUES ($1, $2)
       RETURNING *`,
      [template.id, JSON.stringify(sanitized)]
    );

    const record = result.rows[0];
    const parsedData = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;

    // Response structure tailored for student Fetch API testing
    const responsePayload = {
      id: record.id,
      ...parsedData
    };

    return res.status(201).json({
      success: true,
      message: 'Dynamic API generated successfully!',
      apiId: record.id,
      endpoint: `/api/data/${record.id}`,
      template: {
        id: template.id,
        name: template.name
      },
      data: responsePayload
    });
  } catch (err) {
    console.error('createRecord error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating record', error: err.message });
  }
};

// GET /api/data/:id - Access dynamic JSON response directly via Fetch API
exports.getRecordById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
    }

    const result = await db.query(
      `SELECT r.*, t.name as template_name, t.fields as template_fields
       FROM records r
       LEFT JOIN templates t ON r.template_id = t.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Dynamic API data with ID ${id} not found`
      });
    }

    const row = result.rows[0];
    const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

    // Return the clean dynamic response expected by student practice:
    // { id: 125, productName: 'iPhone 17', price: 1200, ... }
    if (req.query.envelope === 'true') {
      return res.status(200).json({
        success: true,
        id: row.id,
        templateId: row.template_id,
        templateName: row.template_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        data: {
          id: row.id,
          ...dataObj
        }
      });
    }

    return res.status(200).json({
      id: row.id,
      ...dataObj
    });
  } catch (err) {
    console.error('getRecordById error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching record', error: err.message });
  }
};

// GET /api/data - List all generated dynamic data
exports.getAllRecords = async (req, res) => {
  try {
    const templateId = req.query.templateId ? Number(req.query.templateId) : null;
    let queryText = `
      SELECT r.*, t.name as template_name, t.fields as template_fields
      FROM records r
      LEFT JOIN templates t ON r.template_id = t.id
    `;
    const params = [];

    if (templateId) {
      queryText += ' WHERE r.template_id = $1';
      params.push(templateId);
    }
    queryText += ' ORDER BY r.id DESC';

    const result = await db.query(queryText, params);

    const formatted = result.rows.map(row => {
      const dataObj = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      return {
        id: row.id,
        templateId: row.template_id,
        templateName: row.template_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        payload: {
          id: row.id,
          ...dataObj
        }
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    console.error('getAllRecords error:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching records', error: err.message });
  }
};

// PUT /api/data/:id - Update dynamic record data
exports.updateRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
    }

    const existing = await db.query(
      `SELECT r.*, t.fields as template_fields
       FROM records r
       LEFT JOIN templates t ON r.template_id = t.id
       WHERE r.id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Record with ID ${id} not found` });
    }

    const row = existing.rows[0];
    const fields = typeof row.template_fields === 'string' ? JSON.parse(row.template_fields) : (row.template_fields || []);
    const prevData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

    const incomingData = req.body.data && typeof req.body.data === 'object' ? req.body.data : req.body;
    const mergedData = { ...prevData, ...incomingData };

    const { errors, sanitized } = validateAndCastData(fields, mergedData);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const result = await db.query(
      `UPDATE records
       SET data = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(sanitized), id]
    );

    const updated = result.rows[0];
    const dataObj = typeof updated.data === 'string' ? JSON.parse(updated.data) : updated.data;

    return res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: {
        id: updated.id,
        ...dataObj
      }
    });
  } catch (err) {
    console.error('updateRecord error:', err);
    return res.status(500).json({ success: false, message: 'Server error updating record', error: err.message });
  }
};

// DELETE /api/data/:id - Delete dynamic record
exports.deleteRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
    }

    const result = await db.query('DELETE FROM records WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Record with ID ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      message: `Dynamic API record #${id} deleted successfully.`
    });
  } catch (err) {
    console.error('deleteRecord error:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting record', error: err.message });
  }
};
