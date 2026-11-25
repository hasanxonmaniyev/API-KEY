const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const templatesRes = await db.query('SELECT COUNT(*) FROM templates');
    const recordsRes = await db.query('SELECT COUNT(*) FROM records');
    const usersRes = await db.query('SELECT COUNT(*) FROM users');

    const totalTemplates = parseInt(templatesRes.rows[0].count, 10);
    const totalRecords = parseInt(recordsRes.rows[0].count, 10);
    const totalUsers = parseInt(usersRes.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      stats: {
        totalTemplates,
        totalDynamicRecords: totalRecords,
        totalUserApis: totalUsers,
        totalApisGenerated: totalRecords + totalUsers,
        databaseMode: db.isFallback() ? 'local_fallback' : 'postgresql',
        uptimeSeconds: Math.floor(process.uptime())
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats', error: err.message });
  }
});

module.exports = router;
