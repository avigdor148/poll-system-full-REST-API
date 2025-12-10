const knex = require('knex')
const config = require('config')
const logger = require('../logger/my-logger')
const db = require('../db');
const { response } = require('express');
const c = require('config');

const data_base = knex({
    client: 'pg',
    connection: {
        host: config.db_connection.host,
        user: config.db_connection.user,
        password: config.db_connection.password,
        database: config.db_connection.database
    }
})


async function create_table() {
    try {
        const result = await data_base.raw(`CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL ,
    birthday DATE,
    address TEXT
);
`)
        console.log('create finished successfully');
        return {
            response: 201,
            status: "success",
        }
    }
    catch (err) {
        // זיהוי שגיאות לפי קוד PostgreSQL
        if (err.code === '42P07') { // table already exists
            return { status: 'error', type: 'table-exists', error: err.message.replaceAll('\n', ''), response: 409 };
        }
        if (err.code === '42601') { // syntax error
            return { status: 'error', type: 'syntax', error: err.message.replaceAll('\n', ''), response: 400 };
        }
        return { status: 'error', type: 'unknown', error: err.message.replaceAll('\n', ''), response: 500 };
    }
}

async function insert_users5() {
    try {
        const sql = `INSERT INTO jusers (name, age, email, city) VALUES
    ('Arya Stark', 18, 'arya.stark@example.com', 'Winterfell'),
    ('Jon Snow', 20, 'jon.snow@example.com', 'The Wall'),
    ('Daenerys Targaryen', 22, 'daenerys.targaryen@example.com', 'Dragonstone'),
    ('Tyrion Lannister', 24, 'tyrion.lannister@example.com', 'King''s Landing'),
    ('Sansa Stark', 19, 'sansa.stark@example.com', 'Winterfell');`;

        await data_base.raw(sql);

        return {
            response: 201,
            status: "success"
        }

    }
    catch (err) {

        // Handle common PostgreSQL error codes and return consistent response objects
        if (err && err.code) {
            if (err.code === '23505') { // unique_violation
                return { status: 'error', type: 'unique-violation', error: err.message.replaceAll('\n', ''), response: 409 };
            }
            if (err.code === '42601') { // syntax error
                return { status: 'error', type: 'syntax', error: err.message.replaceAll('\n', ''), response: 400 };
            }
            if (err.code === '42P01') { // undefined_table
                return { status: 'error', type: 'undefined-table', error: err.message.replaceAll('\n', ''), response: 404 };
            }
        }
        return { status: 'error', type: 'unknown', error: (err && err.message) ? err.message.replaceAll('\n', '') : String(err), response: 500 };
    }
}

async function get_all_users() {
    try {
        const result = await data_base.raw('SELECT * FROM users;');
        console.log(result.rowCount);

        return {
            status: "success",
            data: result.rows,
            response: 200
        };

    } catch (err) {

        if (err.code === '42P01') {
            return { status: 'error', type: 'undefined-table', error: err.message, response: 404 };
        }

        if (err.code === '42601') {
            return { status: 'error', type: 'syntax', error: err.message, response: 400 };
        }

        return {
            status: 'error',
            type: 'unknown',
            error: err.message,
            response: 500
        };
    }
}


///1.send sql query 2..handle errors and return consistent response objects
//2a handle server errors 2b handle not found 2c handle syntax errors
async function get_user_by_id(id) {
    try {
        const result = await data_base.raw(`SELECT * FROM users WHERE id = ${id};`);

        if (result.rows.length === 0) {
            return { status: 'error', type: 'not-found', response: 404 };
        }

        return { status: 'success', data: result.rows, response: 200 };

    } catch (err) {
        if (err.code === '42601') {
            return { status: 'error', type: 'syntax', error: err.message, response: 400 };
        }
        if (err.code === '42P01') {
            return { status: 'error', type: 'undefined-table', error: err.message, response: 404 };
        }

        return { status: 'error', type: 'unknown', error: err.message, response: 500 };
    }
}

async function delete_table() {
    try {
        const result = await data_base.raw(`DROP TABLE  asgcompany;`);
        return {
            response: 200,
            status: "success",
        }
    } catch (err) {
        if (err.code === '42601') {
            return { status: 'error', type: 'syntax', error: err.message, response: 400 };
        }
        if (err.code === '42P01') {
            return { status: 'error', type: 'undefined-table', error: err.message, response: 404 };
        }

        return { status: 'error', type: 'unknown', error: err.message, response: 500 };
    }
}

async function delete_user_by_id(id) {
    try {
        const result = await data_base.raw(`DELETE FROM users WHERE id = ${id} RETURNING *;`);

        if (result.rowCount === 0) {
            return { status: 'error', type: 'not-found', response: 404 };
        }

        return { status: 'success', data: result.rows[0], response: 200 };

    } catch (err) {
        if (err.code === '42601') {
            return { status: 'error', type: 'syntax', error: err.message, response: 400 };
        }
        if (err.code === '42P01') {
            return { status: 'error', type: 'undefined-table', error: err.message, response: 404 };
        }

        return { status: 'error', type: 'unknown', error: err.message, response: 500 };
    }
}

async function patch_user(id, updated_user) {
    try {
        const query_arr = []
        for (let key in updated_user) {
            query_arr.push(`${key}='${updated_user[key]}'`)
        }

        if (query_arr.length > 0) {
            // check how many employess updated?
            const query = `UPDATE users set ${query_arr.join(', ')} where id=${id} RETURNING *;`
            const result = await data_base.raw(query)
            return { status: 'success', data: result.rows[0], response: 200 };
        } else {
            return { status: 'error', type: 'no-fields-to-update', error: 'No fields provided to update', response: 400 };
        }
    } catch (err) {
        if (err.code === '42601') {
            return { status: 'error', type: 'syntax', error: err.message, response: 400 };
        }
        if (err.code === '42P01') {
            return { status: 'error', type: 'undefined-table', error: err.message, response: 404 };
        }
        if (err.code === '23505') {
            return { status: 'error', type: 'unique-violation', error: err.message, response: 409 };
        }
        return { status: 'error', type: 'unknown', error: err.message, response: 500 };

    }

}


async function update_user(id, updated_user) {
    try {
        const result = await data_base.raw(`UPDATE users set name=?,age=?,email=?,city=? where id=? RETURNING *;`,
            [updated_user.name ? updated_user.name : '',
            updated_user.age ? updated_user.age : 0,
            updated_user.email ? updated_user.email : '',
            updated_user.city ? updated_user.city : '',
                id])
        if (result.rowCount === 0) {
            return { status: 'error', type: 'not-found', response: 404 };
        }
        console.log('updated succeeded for id ' + id);
        return { status: 'success', data: result.rows[0], response: 200 };

    } catch (err) {
        if (err.code === '42601') {
            return { status: 'error', type: 'syntax', error: err.message, response: 400 };
        }
        if (err.code === '42P01') {
            return { status: 'error', type: 'undefined-table', error: err.message, response: 404 };
        }
        if (err.code === '23505') {
            return { status: 'error', type: 'unique-violation', error: err.message, response: 409 };
        }
        return { status: 'error', type: 'unknown', error: err.message, response: 500 };

    }
}




module.exports = {
    create_table, insert_users5, get_all_users, get_user_by_id, delete_table, delete_user_by_id, patch_user, update_user
}