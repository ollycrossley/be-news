const {removeComment} = require("../models/comments-models");
exports.deleteCommentById = (req,res,next) => {
    const {comment_id} = req.params
    removeComment(comment_id).then(comment => {
        res.status(204).send()
    }).catch(err => next(err))
}