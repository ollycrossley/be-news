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
    describe('/api/topics', () => {
        test('GET 200   | Returns 200 status when passed', () => {
            return request(app).get('/api/topics').expect(200)
        });
        test('GET 200   | Returns an array of objects with description and slug keys', () => {
            return request(app).get('/api/topics').expect(200).then(({body}) => {
                body.topics.forEach(topic => {
                    expect(topic).toHaveProperty("slug")
                    expect(topic).toHaveProperty("description")
                })
            })
        });
    });
});