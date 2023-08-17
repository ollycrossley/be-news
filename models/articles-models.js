const db = require('../db/connection')

exports.selectArticles = (topic = null, sort_by = "created_at", order = "desc") => {

    const acceptedOrders = ["author", "title", "article_id", "topic", "created_at", "votes", "comment_count"]
    const acceptedSorts = ["asc", "desc"];

    if (!acceptedOrders.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "bad request" });
    }

    if (!acceptedSorts.includes(order)) {
        return Promise.reject({ status: 400, msg: "bad request" });
    }

    let queryList = [topic]

    let baseQuery = `
    SELECT articles.author,
               title,
               articles.article_id,
               articles.body,
               topic,
               articles.created_at,
               articles.votes,
               article_img_url,
               COUNT(comments.article_id)::INT AS comment_count
        FROM articles
                 LEFT JOIN comments ON articles.article_id = comments.article_id
        WHERE $1::VARCHAR IS NULL OR topic = $1::VARCHAR
        GROUP BY articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes,
                 article_img_url
    `
    baseQuery += ` ORDER BY ${sort_by} ${order};`

    return db.query(baseQuery, queryList).then(({rows}) => {
        return rows
    })
}

exports.selectArticleById = (param_id) => {
    return db.query(`
        SELECT author,
               title,
               article_id,
               body,
               topic,
               created_at,
               votes,
               article_img_url
        FROM articles
        WHERE article_id = $1
    `, [param_id]).then(({rows}) => {
        if (rows.length === 0) return Promise.reject({status: 404, msg: "article does not exist"})
        return rows[0];
    })
}

exports.selectArticleComments = (param_id) => {
    return db.query(`
        SELECT article_id
        FROM articles
        WHERE article_id = $1
    `, [param_id]).then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "article does not exist"})
        }
        return db.query(`
            SELECT *
            FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC
        `, [param_id])
    }).then(({rows}) => {
        return rows
    })
}

exports.insertArticleComment = (articleId, {username, body}) => {
    return db.query(`
        SELECT article_id
        FROM articles
        WHERE article_id = $1
    `, [articleId])
        .then(({rows}) => {
            if (rows.length === 0) {
                return Promise.reject({status: 404, msg: "article does not exist"})
            }
            return db.query(`
                INSERT INTO comments (article_id, author, body)
                VALUES ($1, $2, $3)
                RETURNING *;
            `, [articleId, username, body])
        }).then(({rows}) => {
            return rows[0]
        })
}

exports.updateArticleById = (article_id, {inc_votes}) => {
    return db.query(`
        SELECT article_id
        FROM articles
        WHERE article_id = $1
    `, [article_id])
        .then(({rows}) => {
            if (rows.length === 0) return Promise.reject({status: 404, msg: "article does not exist"})
            if (inc_votes && typeof inc_votes !== "number") return Promise.reject({status: 400, msg: "invalid inc_votes type"})
            return db.query(`
                UPDATE articles
                SET votes = votes + $1
                WHERE article_id = $2
                RETURNING *;`, [inc_votes, article_id])
        }).then(({rows}) => {
            return rows[0]
        })
}