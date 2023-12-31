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
    describe('Model: API', () => {
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
                    const endpointsInApp = app._router.stack.filter(layer => layer.route).map(r => r.route.path)
                    for (const key in body) {
                        endpointsInRes.push(key.substring(key.indexOf("/")))
                    }
                    expect(endpointsInRes).toIncludeSameMembers(endpointsInApp)
                })
            });
            test('GET 404   | Returns an appropriate message when passed an invalid endpoint url', () => {
                return request(app).get('/api/cute_cats').expect(404).then(({body}) => {
                    expect(body.msg).toBe("url not found")
                })
            })
        });
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
        describe('/api/topics/:slug', () => {
            test('GET 200   | Returns an object with the selected slug', () => {
                return request(app).get('/api/topics/mitch').expect(200).then(({body}) => {
                    body = body.topic
                    expect(body).toHaveProperty("slug")
                    expect(body.slug).toBe("mitch")
                    expect(body).toHaveProperty("description")
                })
            })
            test('GET 404   | Returns an error with an appropriate message', () => {
                return request(app).get('/api/topics/football').expect(404).then(({body}) => {
                    expect(body.msg).toBe("topic does not exist")
                })
            });

        });
    });

    describe('Model: Articles', () => {
        describe('/api/articles', () => {
            describe('GET Requests', () => {
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
                test('GET 200   | Returns an object ordered ascending if queried', () => {
                    return request(app).get('/api/articles?order_by=asc').expect(200).then(({body}) => {
                        body = body.articles
                        expect(body).toBeSorted({descending: false})
                    })
                });
                test('GET 200   | Returns an object ordered by authors & descending when only passed authors', () => {
                    return request(app).get('/api/articles?sort_by=author').expect(200).then(({body}) => {
                        body = body.articles
                        expect(body).toBeSortedBy("author", {descending: true})
                    })
                });
                test('GET 200   | Returns objects with only coding topics when passed the query', () => {
                    return request(app).get('/api/articles?topic=mitch').expect(200).then(({body}) => {
                        body = body.articles
                        expect(body).toBeSortedBy("created_at", {descending: true})
                        body.forEach(article => {
                            expect(article.topic).toBe("mitch")
                        })
                    })
                });
                test('GET 200   | Returns empty array when valid topic is passed but no results are available', () => {
                    return request(app).get('/api/articles?topic=paper').expect(200).then(({body}) => {
                        body = body.articles
                        expect(body.length).toBe(0)
                    })
                });
                test('GET 200   | Returns article and ignores invalid queries', () => {
                    return request(app).get('/api/articles?order_by=author').expect(200).then(({body}) => {
                        body = body.articles
                        expect(body).toBeSortedBy("created_at", {descending: true})
                    })
                });
                test('GET 404   | Returns empty array when invalid topic is passed', () => {
                    return request(app).get('/api/articles?topic=swimming').expect(404).then(({body}) => {
                        expect(body.msg).toBe("topic does not exist")
                    })
                });
                test('GET 400   | Returns appropriate message when invalid sort is passed', () => {
                    return request(app).get('/api/articles?sort_by=sausage').expect(400).then(({body}) => {
                        expect(body.msg).toBe("bad request")
                    })
                });
                test('GET 400   | Returns appropriate message when invalid order is passed', () => {
                    return request(app).get('/api/articles?order=inorderplease').expect(400).then(({body}) => {
                        expect(body.msg).toBe("bad request")
                    })
                });
            });
            describe('POST Requests', () => {
                test('POST 201   | Returns 201 and the new article with all properties', () => {
                    return request(app).post(`/api/articles`).send({
                        "author": "lurker",
                        "title": "How a cheese diet could revolutionise football",
                        "body": "Cheese is not only a delicious snack, but also a potential game-changer for football players. According to a recent study by the University of Liverpool, cheese consumption can improve muscle strength, endurance, and recovery in athletes. The researchers found that cheese contains high levels of protein, calcium, and vitamin D, which are essential for muscle health and performance. Moreover, cheese also has anti-inflammatory properties that can reduce muscle soreness and fatigue after intense exercise. By incorporating cheese into their daily diet, football players can boost their physical abilities and gain an edge over their opponents.",
                        "topic": "mitch",
                        "article_img_url": "www.pretendthisisanimage.com"
                    }).expect(201).then(({body}) => {
                        let article = body.article
                        expect(article).toHaveProperty("author")
                        expect(article.author).toBe("lurker")
                        expect(article).toHaveProperty("title")
                        expect(article).toHaveProperty("body")
                        expect(article).toHaveProperty("topic")
                        expect(article.topic).toBe("mitch")
                        expect(article).toHaveProperty("created_at")
                        expect(article).toHaveProperty("votes")
                        expect(article).toHaveProperty("article_img_url")
                        expect(article.article_img_url).toBe("www.pretendthisisanimage.com")
                        expect(article).toHaveProperty("comment_count")
                    })
                });
                test('POST 201   | Returns 201 and the new article with all properties even when not passed a url', () => {
                    return request(app).post(`/api/articles`).send({
                        "author": "lurker",
                        "title": "How a cheese diet could revolutionise football",
                        "body": "Cheese is not only a delicious snack, but also a potential game-changer for football players. According to a recent study by the University of Liverpool, cheese consumption can improve muscle strength, endurance, and recovery in athletes. The researchers found that cheese contains high levels of protein, calcium, and vitamin D, which are essential for muscle health and performance. Moreover, cheese also has anti-inflammatory properties that can reduce muscle soreness and fatigue after intense exercise. By incorporating cheese into their daily diet, football players can boost their physical abilities and gain an edge over their opponents.",
                        "topic": "mitch",
                    }).expect(201).then(({body}) => {
                        let article = body.article
                        expect(article).toHaveProperty("article_img_url")
                    })
                });
                test('POST 404   | Returns 404 when author is not valid', () => {
                    return request(app).post(`/api/articles`).send({
                        "author": "notalurker",
                        "title": "How a cheese diet could revolutionise football",
                        "body": "Cheese is not only a delicious snack, but also a potential game-changer for football players. According to a recent study by the University of Liverpool, cheese consumption can improve muscle strength, endurance, and recovery in athletes. The researchers found that cheese contains high levels of protein, calcium, and vitamin D, which are essential for muscle health and performance. Moreover, cheese also has anti-inflammatory properties that can reduce muscle soreness and fatigue after intense exercise. By incorporating cheese into their daily diet, football players can boost their physical abilities and gain an edge over their opponents.",
                        "topic": "mitch",
                    }).expect(404).then(({body}) => {
                        expect(body.msg).toBe("user does not exist")
                    })
                });
                test('POST 404   | Returns 404 and a message when passed an invalid topic', () => {
                    return request(app).post(`/api/articles`).send({
                        "author": "lurker",
                        "title": "How a cheese diet could revolutionise football",
                        "body": "Cheese is not only a delicious snack, but also a potential game-changer for football players. According to a recent study by the University of Liverpool, cheese consumption can improve muscle strength, endurance, and recovery in athletes. The researchers found that cheese contains high levels of protein, calcium, and vitamin D, which are essential for muscle health and performance. Moreover, cheese also has anti-inflammatory properties that can reduce muscle soreness and fatigue after intense exercise. By incorporating cheese into their daily diet, football players can boost their physical abilities and gain an edge over their opponents.",
                        "topic": "football",
                    }).expect(404).then(({body}) => {
                        expect(body.msg).toBe("topic does not exist")
                    })
                });
                test('POST 400   | Returns 400 and a message when not passed a required key', () => {
                    return request(app).post(`/api/articles`).send({
                        "title": "How a cheese diet could revolutionise football",
                        "body": "Cheese is not only a delicious snack, but also a potential game-changer for football players. According to a recent study by the University of Liverpool, cheese consumption can improve muscle strength, endurance, and recovery in athletes. The researchers found that cheese contains high levels of protein, calcium, and vitamin D, which are essential for muscle health and performance. Moreover, cheese also has anti-inflammatory properties that can reduce muscle soreness and fatigue after intense exercise. By incorporating cheese into their daily diet, football players can boost their physical abilities and gain an edge over their opponents.",
                        "topic": "mitch"
                    }).expect(400).then(({body}) => {
                        expect(body.msg).toBe("request json missing reference to key 'author'")
                    })
                });

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
            test('GET 200   | Return 200 and ensure article has comment_count key', () => {
                return request(app).get('/api/articles/1').expect(200).then(({body}) => {
                    body = body.article
                    expect(body).toHaveProperty("comment_count")
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
                return request(app).delete('/api/comments/2').expect(204).then(() => {
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

    describe('Model: Users', () => {
        describe('/api/users', () => {
            test('GET 200   | Returns 200 and all the requested users', () => {
                return request(app).get('/api/users').expect(200).then(({body}) => {
                    body = body.users
                    expect(body.length).not.toBe(0)
                    body.forEach(user => {
                        expect(user).toHaveProperty("username")
                        expect(user).toHaveProperty("name")
                        expect(user).toHaveProperty("avatar_url")
                    })
                })
            });
        });
        describe('/api/users/:username', () => {
            test('GET 200   | Return the correct user object ', () => {
                return request(app).get('/api/users/lurker').expect(200).then(({body}) => {
                    body = body.user
                    expect(body).toHaveProperty("username")
                    expect(body.username).toBe("lurker")
                    expect(body).toHaveProperty("name")
                    expect(body).toHaveProperty("avatar_url")
                })
            });
            test('GET 404   | Return 404 and an appropriate message when passed valid id that does not exist', () => {
                return request(app).get('/api/users/olly').expect(404).then(({body}) => {
                    expect(body.msg).toBe("user does not exist")
                })
            });
        });
    });

});