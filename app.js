const express = require("express");
const {errorHandler} = require('./db/error-handler')
const app = express();
const {getTopics} = require('./controllers/topics-controllers')
const {getEndpoints} = require("./controllers/api-controllers");
app.use(express.json());

app.get('/api', getEndpoints)
app.get('/api/topics', getTopics)

app.use(errorHandler)

module.exports = app;