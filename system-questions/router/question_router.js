const express = require('express')
const questions_dal = require('../dals/question_dal')
const logger = require('../../logger/my-logger')
const router = express.Router()

router.post('/create-table', async (request, response) => {
    logger.info('POST /create-table called')
    try {
        const result = await questions_dal.create_table()
        logger.info('create_table result', { status: result.status, type: result.type, response: result.response })
        return response.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in POST /create-table', { message: err.message, stack: err.stack })
        return response.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
})

router.post('/insert-5-questions', async (request, response) => {
    logger.info('POST /insert-5-questions called')
    try {
        const result = await questions_dal.insert_questions5()
        logger.info('insert_questions5 result', { status: result.status, type: result.type, response: result.response })
        return response.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in POST /insert-5-questions', { message: err.message, stack: err.stack })
        return response.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
})

router.get('/all-questions', async (request, response) => {
    logger.info('GET /all-questions called')
    try {
        const result = await questions_dal.get_all_questions()
        logger.info('get_all_questions result', { status: result.status, type: result.type, response: result.response })
        return response.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in GET /all-questions', { message: err.message, stack: err.stack })
        return response.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
})

router.get('/all-questions/:id', async (req, res) => {
    const id = req.params.id;
    logger.info('GET /all-questions/:id called', { id })

    if (isNaN(id)) {
        logger.error('Invalid id in GET /all-questions/:id', { id })
        return res.status(400).json({ error: "invalid-id" });
    }

    try {
        const result = await questions_dal.get_question_by_id(id);
        logger.info('get_question_by_id result', { id, status: result.status, type: result.type, response: result.response })
        return res.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in GET /all-questions/:id', { id, message: err.message, stack: err.stack })
        return res.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
});

router.delete('/delete-table', async (request, response) => {
    logger.info('DELETE /delete-table called')
    try {
        const result = await questions_dal.delete_table()
        logger.info('delete_table result', { status: result.status, type: result.type, response: result.response })
        return response.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in DELETE /delete-table', { message: err.message, stack: err.stack })
        return response.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
})

router.delete('/question-delete/:id', async (req, res) => {
    const id = req.params.id;
    logger.info('DELETE /question-delete/:id called', { id })

    if (isNaN(id)) {
        logger.error('Invalid id in DELETE /question-delete/:id', { id })
        return res.status(400).json({ error: "invalid-id" });
    }

    try {
        const result = await questions_dal.delete_question_by_id(id);
        logger.info('delete_question_by_id result', { id, status: result.status, type: result.type, response: result.response })
        return res.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in DELETE /question-delete/:id', { id, message: err.message, stack: err.stack })
        return res.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
});

router.patch('/question-update/:id', async (req, res) => {
    const id = req.params.id;
    const updated_question = req.body;
    logger.info('PATCH /question-update/:id called', { id, updated_question })

    if (isNaN(id)) {
        logger.error('Invalid id in PATCH /question-update/:id', { id })
        return res.status(400).json({ error: "invalid-id" });
    }
    try {
        const result = await questions_dal.patch_question(id, updated_question);
        logger.info('patch_question result', { id, status: result.status, type: result.type, response: result.response })
        return res.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in PATCH /question-update/:id', { id, message: err.message, stack: err.stack })
        return res.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
});

router.put('/question-put/:id', async (req, res) => {
    const id = req.params.id;
    const updated_question = req.body;
    logger.info('PUT /question-put/:id called', { id, updated_question })

    if (isNaN(id)) {
        logger.error('Invalid id in PUT /question-put/:id', { id })
        return res.status(400).json({ error: "invalid-id" });
    }
    try {
        const result = await questions_dal.update_question(id, updated_question);
        logger.info('update_question result', { id, status: result.status, type: result.type, response: result.response })
        return res.status(result.response).json({
            status: result.status,
            type: result.type,
            error: result.error,
            data: result.data
        });
    } catch (err) {
        logger.error('Error in PUT /question-put/:id', { id, message: err.message, stack: err.stack })
        return res.status(500).json({ status: 'error', type: 'server', error: err.message, data: null });
    }
});

module.exports = router
