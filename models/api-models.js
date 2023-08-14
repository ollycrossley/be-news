const db = require('../db/connection')
const fs = require("fs/promises");

exports.showEndpoints = () => {
    return fs.readFile('./endpoints.json', "utf-8").then(fileRead => {
        return JSON.parse(fileRead)
    })
}
