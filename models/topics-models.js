const db = require('../db/connection')

exports.selectTopics = () => {
    return db.query(`
        SELECT *
        FROM topics`).then(({rows}) => {
        return rows
    })
}

exports.selectTopicBySlug = (topic) => {
    return db.query(`
        SELECT *
        FROM topics
        WHERE $1::VARCHAR IS NULL OR slug = $1::VARCHAR`, [topic]).then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "topic does not exist"})
        }
        return rows[0]
    })
}