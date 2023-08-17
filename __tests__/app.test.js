//#region Setup
const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const {topicData, userData, articleData, commentData} = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
beforeEach(() => seed({topicData, userData, articleData, commentData}))
afterAll(() => db.end())
//#endregion

describe('Endpoint Tests', () => {
    describe('/api', () => {
        test('GET 200   | Returns 200 and an object with correct endpoint values within', () => {
            return request(app).get('/api').expect(200).then(({body}) => {
                expect(Object.keys(body).length > 0).toBe(true)
                for (const key in body) {
                    expect(body[key]).toHaveProperty("description")
                    expect(body[key]).toHaveProperty("queries")
                    expect(body[key]).toHaveProperty("bodyFormat")
                    expect(body[key]).toHaveProperty("exampleResponse")
                }
            })
        });
        test('GET 200   | Returns instructions for all available endpoints', () => {
            return request(app).get('/api').expect(200).then(({body}) => {
                const endpointsInRes = []
                const endpointsInApp = app._router.stack.filter(layer => layer.route).map(r => r = r.route.path)
                for (const key in body) {
                    endpointsInRes.push(key.substring(key.indexOf("/")))
                }
                expect(endpointsInRes).toContain(...endpointsInApp)
            })
        });
        test('GET 404   | Returns an appropriate message when passed an invalid endpoint url', () => {
            return request(app).get('/api/cute_cats').expect(404).then(({body}) => {
                expect(body.msg).toBe("url not found")
            })
        })
    });

    describe('Model: Topics', () => {
        describe('/api/topics', () => {
            test('GET 200   | Returns 200 status when passed', () => {
                return request(app).get('/api/topics').expect(200)
            });
            test('GET 200   | Returns an array of objects with description and slug keys', () => {
                return request(app).get('/api/topics').expect(200).then(({body}) => {
                    expect(body.topics.length > 0).toBe(true)
                    if (body.topics.length > 0) {
                        body.topics.forEach(topic => {
                            expect(topic).toHaveProperty("slug")
                            expect(topic).toHaveProperty("description")
                        })
                    }
                })
            });
        });
    });

    describe('Model: Articles', () => {
        describe('/api/articles', () => {
            test('GET 200   | Returns 200 and an object of all articles with comment_count', () => {
                return request(app).get('/api/articles').expect(200).then(({body}) => {
                    body = body.articles
                    expect(body.length).not.toBe(0)
                    body.forEach(article => {
                        expect(article).toHaveProperty("author")
                        expect(article).toHaveProperty("title")
                        expect(article).toHaveProperty("body")
                        expect(article).toHaveProperty("topic")
                        expect(article).toHaveProperty("created_at")
                        expect(article).toHaveProperty("votes")
                        expect(article).toHaveProperty("article_img_url")
                        expect(article).toHaveProperty("comment_count")
                    })
                })
            });
            test('GET 200   | Returns object ordered by date descending', () => {
                return request(app).get('/api/articles').expect(200).then(({body}) => {
                    body = body.articles
                    expect(body).toBeSorted({key: "created_at", descending: true})
                })
            });

        });
        describe('/api/articles/:article_id', () => {
            test('GET 200   | Return 200 and correct object when passed id', () => {
                return request(app).get('/api/articles/3').expect(200).then(({body}) => {
                    body = body.article
                    expect(body.article_id).toBe(3)
                    expect(body).toHaveProperty("author")
                    expect(body).toHaveProperty("title")
                    expect(body).toHaveProperty("body")
                    expect(body).toHaveProperty("topic")
                    expect(body).toHaveProperty("created_at")
                    expect(body).toHaveProperty("votes")
                    expect(body).toHaveProperty("article_img_url")
                })
            });
            test("GET 404   | Return 404 and sends an appropriate error message when given a valid but non-existent id", () => {
                return request(app).get('/api/articles/10000').expect(404).then(({body}) => {
                    expect(body.msg).toBe('article does not exist')
                })
            });
            test('GET 400   | Return 400 and sends an appropriate error message when given an invalid id', () => {
                return request(app).get('/api/articles/three').expect(400).then(({body}) => {
                    expect(body.msg).toBe('invalid id')
                })
            });
            test('PATCH 200 | Return 200 and edited article with correct added/subtracted vote amount', () => {
                return request(app).patch('/api/articles/1').send({inc_votes: 3}).expect(200)
                    .then(({body}) => {

                    body = body.article
                    expect(body.article_id).toBe(1)
                    expect(body.votes).toBe(103)
                    expect(body).toHaveProperty("author")
                    expect(body).toHaveProperty("title")
                    expect(body).toHaveProperty("body")
                    expect(body).toHaveProperty("topic")
                    expect(body).toHaveProperty("created_at")
                    expect(body).toHaveProperty("article_img_url")
                    return request(app).patch('/api/articles/1').send({inc_votes: -3}).expect(200)
                }).then(({body}) => {
                        body = body.article
                        expect(body.article_id).toBe(1)
                        expect(body.votes).toBe(100)
                    })
            });
            test('PATCH 404 | Return 404 and sends appropriate message when valid non existent id', () => {
                return request(app).patch('/api/articles/10000').send({inc_votes: -3}).expect(404).then(({body}) => {
                    expect(body.msg).toBe('article does not exist')
                })
            });
            test('PATCH 400 | Return 400 and sends appropriate message when invalid id is passed', () => {
                return request(app).patch('/api/articles/three').send({inc_votes: -3}).expect(400).then(({body}) => {
                    expect(body.msg).toBe('invalid id')
                })
            });
            test('PATCH 400 | Return 400 and appropriate message when passed invalid/missing inc_votes key', () => {
                return request(app).patch('/api/articles/3').send({inc_voters: 3}).expect(400).then(({body}) => {
                    expect(body.msg).toBe("request json missing reference to key 'votes'")
                })
            });
            test('PATCH 400 | Return 400 and appropriate message when passed invalid/missing inc_votes value', () => {
                return request(app).patch('/api/articles/3').send({inc_votes: "three"}).expect(400).then(({body}) => {
                    expect(body.msg).toBe("invalid inc_votes type")
                })
            });
        });
        describe('/api/articles/:article_id/comments', () => {
            test('GET 200   | Return 200 and array with correct comment objects', () => {
                return request(app).get('/api/articles/3/comments').expect(200).then(({body}) => {
                    body = body.comments
                    expect(body.length).not.toBe(0)
                    body.forEach(comment => {
                        expect(comment).toHaveProperty("comment_id")
                        expect(comment).toHaveProperty("votes")
                        expect(comment).toHaveProperty("created_at")
                        expect(comment).toHaveProperty("author")
                        expect(comment).toHaveProperty("body")
                        expect(comment.article_id).toBe(3)
                    })
                })
            });
            test('GET 200   | Return the array ordered by most recent comments first', () => {
                return request(app).get('/api/articles/3/comments').expect(200).then(({body}) => {
                    body = body.comments
                    expect(body).toBeSortedBy("created_at", {descending: true})
                })
            });
            test('GET 200   | Return empty array when given article_id with no comments', () => {
                return request(app).get('/api/articles/2/comments').expect(200).then(({body}) => {
                    body = body.comments
                    expect(body.length).toBe(0)
                })
            });
            test("GET 404   | Return 404 and sends an appropriate error message when given a valid but non-existent id", () => {
                return request(app).get('/api/articles/10000/comments').expect(404).then(({body}) => {
                    expect(body.msg).toBe('article does not exist')
                })
            });
            test('GET 400   | Return 400 and sends an appropriate error message when given an invalid id', () => {
                return request(app).get('/api/articles/three/comments').expect(400).then(({body}) => {
                    expect(body.msg).toBe('invalid id')
                })
            });
            test('POST 201  | Return 201 and returns completed comment format', () => {
                return request(app)
                    .post('/api/articles/3/comments')
                    .send({username: "butter_bridge", body: "My awesome comment"})
                    .expect(201)
                    .then(({body}) => {
                        body = body.comment
                        expect(body.author).toBe("butter_bridge")
                        expect(body.body).toBe("My awesome comment")
                        expect(body.article_id).toBe(3)
                        expect(body).toHaveProperty("comment_id")
                        expect(body).toHaveProperty("body")
                        expect(body).toHaveProperty("article_id")
                        expect(body).toHaveProperty("author")
                        expect(body).toHaveProperty("votes")
                        expect(body).toHaveProperty("created_at")
                    })
            });
            test('POST 400  | Returns 400 and a message when passed a bad JSON request', () => {
                return request(app)
                    .post('/api/articles/3/comments')
                    .send({username: "butter_bridge", content: "My awesome comment"})
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("request json missing reference to key 'body'")
                    })
            });
            test('POST 404  | Returns 400 and a message when bad article id is passed', () => {
                return request(app)
                    .post('/api/articles/31000/comments')
                    .send({username: "butter_bridge", body: "My awesome comment"})
                    .expect(404)
                    .then(({body}) => {
                        expect(body.msg).toBe("article does not exist")
                    })
            });
            test('POST 400  | Returns 400 with a message and details when username is not in table', () => {
                return request(app)
                    .post('/api/articles/1/comments')
                    .send({username: "big_steve", body: "I am big steve."})
                    .expect(400)
                    .then(({body}) => {
                        expect(body.msg).toBe("bad request")
                        expect(body.details).toBe('Key (author)=(big_steve) is not present in table "users".')
                    })
            });
            test('POST 400   | Return 400 and sends an appropriate error message when given an invalid id', () => {
                return request(app).post('/api/articles/three/comments').send({
                    username: "bob",
                    body: "i am bob"
                }).expect(400).then(({body}) => {
                    expect(body.msg).toBe('invalid id')
                })
            });
        });

    })

    describe('Model: Comments', () => {
        describe('api/comments/:comment_id', () => {
            test('DELETE 204 | Returns 204 and deletes the correct comment', () => {
                return request(app).delete('/api/comments/1').expect(204)
            });
            test('DELETE 404 | Returns 404 when trying to delete a non-existent/previously deleted comment', () => {
                return request(app).delete('/api/comments/2').expect(204).then(()=> {
                    return request(app).delete('/api/comments/2').expect(404).then(({body}) => {
                        expect(body.msg).toBe("comment does not exist")
                    })
                })
            });
            test('DELETE 400 | Returns 400 when passed an invalid/unexpected id type', () => {
                return request(app).delete('/api/comments/three').expect(400).then(({body}) => {
                    expect(body.msg).toBe("invalid id")
                })
            });
        });
    });

});