const {selectTopics, selectTopicBySlug} = require("../models/topics-models");

exports.getTopics = (req, res, next) => {
    selectTopics().then(topics => {
        res.status(200).send({topics})
    }).catch(err => next(err))
}

exports.getTopicBySlug = (req, res, next) => {
    const {slug} = req.params
    selectTopicBySlug(slug).then(topic => {
        res.status(200).send({topic})
    }).catch(err => next(err))
}