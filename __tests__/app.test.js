//#region Setup
const app = require('../app')
const request = require('supertest')
const db = require('../db/connection')
const {topicData, userData, articleData, commentData} = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
beforeEach(() => seed({topicData, userData, articleData, commentData}))
afterAll(() => db.end())
//#endregion

describe('Model: Topics', () => {
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
});