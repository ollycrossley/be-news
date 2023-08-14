const {showEndpoints} = require("../models/api-models");


exports.getEndpoints = (require, response, next) => {
    showEndpoints().then((apis) => {
        response.status(200).send(apis)
    })
}