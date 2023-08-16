const {selectArticleById, selectArticles, selectArticleComments, insertArticleComment} = require("../models/articles-models");

exports.getArticles = (req, res, next) => {
    selectArticles().then(articles => {
        res.status(200).send({articles})
    }).catch(err => next(err))
}
exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    selectArticleById(article_id).then(article => {
        res.status(200).send({article})
    }).catch(err => next(err))
}
exports.getArticleComments = (req, res, next) => {
    const {article_id} = req.params
    selectArticleComments(article_id).then(comments => {
        res.status(200).send(comments)
    }).catch(err => next(err))
}

exports.postArticleComment = (req, res, next) => {
    const {article_id} = req.params
    const comment = req.body
    insertArticleComment(article_id, comment).then(result => {
        res.status(201).send(result)
    }).catch(err => next(err))
}