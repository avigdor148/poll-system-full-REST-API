// db.js
const { Pool } = require('pg');
const config = require('config'); // מבוסס על קובץ config/default.json

// בודק אם config מלא, אחרת משתמש בערכים ברירת מחדל
const dbConfig = {
    user: config.db_connection?.user || 'postgres',
    host: config.db_connection?.host || '127.0.0.1',
    database: config.db_connection?.database || 'postgres',
    password: config.db_connection?.password || 'postgres',
    port: config.db_connection?.port || 5432,
    max: 10,           // מספר החיבורים המרביים
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

// מחבר Pool
const pool = new Pool(dbConfig);

// בדיקה אוטומטית להתחברות
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ PostgreSQL connected successfully');
        release();
    }
});

// פונקציה להרצת שאילתות
const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error('❌ Query error:', err.message);
        throw err;
    }
};

module.exports = {
    query,
    pool
};
