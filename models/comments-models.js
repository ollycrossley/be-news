const db = require('../db/connection')

exports.removeComment = (commentId) => {
    return db.query(`
        SELECT comment_id
        FROM comments
        WHERE comment_id = $1
    `, [commentId])
        .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "comment does not exist"})
        }
        return db.query(`
            DELETE
            FROM comments
            WHERE comment_id = $1
            RETURNING *
        `, [commentId])
    }).then(({rows}) => {
            return rows[0]
        })
}