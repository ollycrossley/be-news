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
        test("GET 404   | Return 400 and sends an appropriate error message when given a valid but non-existent id", () => {
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
});