const express = require("express");
const {errorHandler} = require('./db/error-handler')
const app = express();
const {getTopics} = require('./controllers/topics-controllers')
const {getEndpoints} = require("./controllers/api-controllers");
const {getArticleById} = require("./controllers/articles-controllers");

app.get('/api', getEndpoints)
app.get('/api/topics', getTopics)
app.get('/api/articles/:article_id', getArticleById)

app.use((req, res) => {
    res.status(404).send({msg: "url not found"})
})

app.use(errorHandler)

module.exports = app;