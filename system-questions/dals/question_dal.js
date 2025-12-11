const knex = require('knex')
const config = require('config')
const logger = require('../../logger/my-logger')
const db = require('../../db');
const { response } = require('express');
const c = require('config');

const data_base = knex({
    client: 'pg',
    connection: {
        host: config.db_connection.host,
        question: config.db_connection.question,
        password: config.db_connection.password,
        database: config.db_connection.database
    }
})


async function create_table() {
    try {
        const result = await data_base.raw(`CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    question_title TEXT NOT NULL,
    answer1 TEXT NOT NULL,
    answer2 TEXT NOT NULL,
    answer3 TEXT NOT NULL,
    answer4 TEXT NOT NULL
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

async function insert_questions5() {
    try {
        const sql = `INSERT INTO questions (question_title, answer1, answer2, answer3, answer4) VALUES
    ('How satisfied are you with your current vehicle?',
     'Very satisfied', 'Satisfied', 'Neutral', 'Not satisfied'),

    ('What type of car do you plan to purchase next?',
     'Sedan', 'SUV', 'Electric Vehicle', 'Truck'),

    ('Which factor is most important when choosing a car?',
     'Price', 'Fuel efficiency', 'Design', 'Safety features'),

    ('How likely are you to recommend our company to others?',
     'Very likely', 'Somewhat likely', 'Not sure', 'Unlikely'),

    ('Where did you first hear about our company?',
     'Online advertisement', 'Friend or family', 'Social media', 'Car dealership');

`;

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

async function get_all_questions() {
    try {
        const result = await data_base.raw('SELECT * FROM questions;');
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
async function get_question_by_id(id) {
    try {
        const result = await data_base.raw(`SELECT * FROM questions WHERE id = ${id};`);

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
        const result = await data_base.raw(`DROP TABLE  questions;`);
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

async function delete_question_by_id(id) {
    try {
        const result = await data_base.raw(`DELETE FROM questions WHERE id = ${id} RETURNING *;`);

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

async function patch_question(id, updated_question) {
    try {
        const query_arr = []
        for (let key in updated_question) {
            query_arr.push(`${key}='${updated_question[key]}'`)
        }

        if (query_arr.length > 0) {
            // check how many employess updated?
            const query = `UPDATE questions set ${query_arr.join(', ')} where id=${id} RETURNING *;`
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


async function update_question(id, updated_question) {
    try {
        const result = await data_base.raw(
    `UPDATE questions
     SET name = ?, 
         last_name = ?, 
         email = ?, 
         password = ?, 
         birthday = ?, 
         address = ?
     WHERE id = ?
     RETURNING *;`,
    [
        updated_question.name || '',
        updated_question.last_name || '',
        updated_question.email || '',
        updated_question.password || '',
        updated_question.birthday || null,
        updated_question.address || '',
        id
    ]
);

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
    create_table, insert_questions5, get_all_questions, get_question_by_id, delete_table, delete_question_by_id, patch_question, update_question
}