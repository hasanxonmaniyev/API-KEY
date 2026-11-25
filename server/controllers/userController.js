const db = require('../config/db');

// Validation helper for required user fields
function validateUser(body) {
  const errors = [];
  const firstName = body.firstName || body.first_name;
  const lastName = body.lastName || body.last_name;
  const age = body.age;
  const profession = body.profession;
  const city = body.city;

  if (!firstName || String(firstName).trim() === '') {
    errors.push('First Name is required');
  }
  if (!lastName || String(lastName).trim() === '') {
    errors.push('Last Name is required');
  }
  if (age === undefined || age === null || isNaN(Number(age)) || Number(age) < 1) {
    errors.push('Age must be a positive valid number');
  }
  if (!profession || String(profession).trim() === '') {
    errors.push('Profession is required');
  }
  if (!city || String(city).trim() === '') {
    errors.push('City is required');
  }

  return errors;
}

// Map db row to clean student-friendly JSON format
function formatUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    age: Number(row.age),
    carName: row.car_name || '',
    fianceName: row.fiance_name || '',
    profession: row.profession,
    city: row.city,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// POST /api/users - Create a new user API
exports.createUser = async (req, res) => {
  try {
    const errors = validateUser(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const firstName = req.body.firstName || req.body.first_name;
    const lastName = req.body.lastName || req.body.last_name;
    const age = Number(req.body.age);
    const carName = req.body.carName || req.body.car_name || '';
    const fianceName = req.body.fianceName || req.body.fiance_name || '';
    const profession = req.body.profession;
    const city = req.body.city;

    const result = await db.query(
      `INSERT INTO users (first_name, last_name, age, car_name, fiance_name, profession, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [firstName, lastName, age, carName, fianceName, profession, city]
    );

    const user = formatUser(result.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'User API created successfully',
      data: user,
      apiEndpoint: `/api/users/${user.id}`
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error while creating user', error: err.message });
  }
};

// GET /api/users - Get all created users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY id DESC');
    const users = result.rows.map(formatUser);
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching users', error: err.message });
  }
};

// GET /api/users/:id - Get one user by ID
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
    }

    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `User with ID ${id} not found` });
    }

    const user = formatUser(result.rows[0]);
    // Can return user directly or enveloped; student endpoints love direct JSON or enveloped with id
    return res.status(200).json(user);
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching user', error: err.message });
  }
};

// PUT /api/users/:id - Update user data
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
    }

    // Check if user exists
    const existing = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `User with ID ${id} not found` });
    }

    const currentUser = existing.rows[0];

    const firstName = req.body.firstName || req.body.first_name || currentUser.first_name;
    const lastName = req.body.lastName || req.body.last_name || currentUser.last_name;
    const age = req.body.age !== undefined ? Number(req.body.age) : currentUser.age;
    const carName = req.body.carName !== undefined ? req.body.carName : (req.body.car_name !== undefined ? req.body.car_name : currentUser.car_name);
    const fianceName = req.body.fianceName !== undefined ? req.body.fianceName : (req.body.fiance_name !== undefined ? req.body.fiance_name : currentUser.fiance_name);
    const profession = req.body.profession || currentUser.profession;
    const city = req.body.city || currentUser.city;

    const result = await db.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, age = $3, car_name = $4, fiance_name = $5, profession = $6, city = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [firstName, lastName, age, carName, fianceName, profession, city, id]
    );

    const updated = formatUser(result.rows[0]);
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating user', error: err.message });
  }
};

// DELETE /api/users/:id - Delete user data
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameter' });
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `User with ID ${id} not found` });
    }

    return res.status(200).json({
      success: true,
      message: `User with ID ${id} has been deleted permanently.`
    });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error while deleting user', error: err.message });
  }
};
