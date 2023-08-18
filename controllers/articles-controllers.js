const {selectArticleById, selectArticles, selectArticleComments, insertArticleComment, updateArticleById, insertArticle} = require("../models/articles-models");
const {selectTopicBySlug} = require("../models/topics-models");
const {selectUserByUsername} = require("../models/users-models");

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query || undefined;
    const promises = [selectTopicBySlug(topic), selectArticles(topic, sort_by, order)]
    Promise.all(promises).then(awaitedPromises => {
        res.status(200).send({articles: awaitedPromises[1]})
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
    const promises = [selectArticleById(article_id), selectArticleComments(article_id)]
    Promise.all(promises).then(resolvedPromises=> {
        res.status(200).send({comments: resolvedPromises[1]})
    }).catch(err => next(err))
}

exports.postArticle = (req, res, next) => {
    const article = req.body
    article.article_img_url = article.article_img_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png"
    const promises = [selectUserByUsername(article.author), selectTopicBySlug(article.topic), insertArticle(article)]
    Promise.all(promises).then(awaitedPromises=> {
        return selectArticleById(awaitedPromises[2]["article_id"])
    }).then(article => {
        res.status(201).send({article})
    }).catch(err => next(err))
}

exports.postArticleComment = (req, res, next) => {
    const {article_id} = req.params
    const comment = req.body
    const promises = [selectArticleById(article_id), insertArticleComment(article_id, comment)]
    Promise.all(promises).then(resolvedPromise => {
        res.status(201).send({comment: resolvedPromise[1]})
    }).catch(err => next(err))
}

exports.patchArticleById = (req, res, next)  => {
    const {article_id} = req.params
    const article = req.body
    const promises = [selectArticleById(article_id), updateArticleById(article_id, article)]
    Promise.all(promises).then(resolvedPromises => {
        res.status(200).send({article: resolvedPromises[1]})
    }).catch(err => next(err))
}