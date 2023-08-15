const db = require('../db/connection')

exports.selectArticles = () => {
    return db.query(`
        SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id)::INT AS comment_count
        FROM articles
                 LEFT JOIN comments on articles.article_id = comments.article_id
        GROUP BY articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url
    `).then(({rows}) => {
        return rows
    })
}

exports.selectArticleById = (param_id) => {
    return db.query(`
    SELECT author, title, article_id, body, topic, created_at, votes, article_img_url
    FROM articles
    WHERE article_id = $1
    `, [param_id]).then(({rows}) => {
        if (rows.length === 0) return Promise.reject({status: 404, msg: "article does not exist"})
        return rows[0];
    })
}