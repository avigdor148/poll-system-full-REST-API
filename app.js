const express = require('express')
const body_parser = require('body-parser')
const config = require('config')
const cors = require('cors')
const path = require('path')
const users_router = require('./system-users/router/users-router')

const app = express()

app.use(body_parser.json())

app.use(cors())

app.use(express.static(path.join('.', '/static/')))

app.use('/api/users', users_router_router)

 const server_api = app.listen(config.server.port, () => {
     console.log(`====== express server is running on port ${config.server.port} =======`);
    })