const db = require('../db/connection')

exports.selectUsers = () => {
    return db.query(`
    SELECT * FROM users
    `).then(({rows}) => {
        return rows;
    })
}

exports.selectUserByUsername = (username) => {
    return db.query(`
        SELECT *
        FROM users
        WHERE $1::VARCHAR IS NULL OR username = $1::VARCHAR`, [username]).then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "user does not exist"})
        }
        return rows[0]
    })
}