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
                expect(endpointsInRes).toEqual(endpointsInApp)
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
                    expect(body.articles.length).not.toBe(0)
                    body.articles.forEach(article => {
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
                    expect(body.articles).toBeSorted({key: "created_at", descending: true})
                })
            });

        });
        describe('/api/articles/:article_id', () => {
            test('GET 200   | Return 200 and correct object when passed id', () => {
                return request(app).get('/api/articles/3').expect(200).then(({body}) => {
                    expect(body.article.article_id).toBe(3)
                    expect(body.article).toHaveProperty("author")
                    expect(body.article).toHaveProperty("title")
                    expect(body.article).toHaveProperty("body")
                    expect(body.article).toHaveProperty("topic")
                    expect(body.article).toHaveProperty("created_at")
                    expect(body.article).toHaveProperty("votes")
                    expect(body.article).toHaveProperty("article_img_url")
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
        });
        describe('/api/articles/:article_id/comments', () => {
            test('GET 200   | Return 200 and array with correct comment objects', () => {
                return request(app).get('/api/articles/3/comments').expect(200).then(({body}) => {
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
                    expect(body).toBeSortedBy("created_at", {descending: true})
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
        });
    })
    
});