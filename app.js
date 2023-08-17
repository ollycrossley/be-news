const express = require("express");
const {errorHandler} = require('./db/error-handler')
const app = express();
const {getTopics} = require('./controllers/topics-controllers')
const {getEndpoints} = require("./controllers/api-controllers");
const {getArticleById, getArticles, getArticleComments, postArticleComment, patchArticleById} = require("./controllers/articles-controllers");
const {deleteCommentById} = require("./controllers/comments-controller");

app.use(express.json())

// GET Requests
app.get('/api', getEndpoints)
app.get('/api/topics', getTopics)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles/:article_id/comments', getArticleComments)

// POST Requests
app.post('/api/articles/:article_id/comments', postArticleComment)

// PATCH Requests
app.patch('/api/articles/:article_id', patchArticleById)

// DELETE Requests
app.delete('/api/comments/:comment_id', deleteCommentById)

app.use((req, res) => {
    res.status(404).send({msg: "url not found"})
})

app.use(errorHandler)

module.exports = app;