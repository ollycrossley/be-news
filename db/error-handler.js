exports.errorHandler = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else if (err.code === "22P02") {
        res.status(400).send({ msg: 'invalid id' });
    } else if (err.code === "23502") {
        let missingKey = ""
        if (err.column === "author") {
            missingKey = "username"
        } else if (err.column === "body") {
            missingKey = "body"
        }
        res.status(400).send({msg: `request json missing key '${missingKey}'`})
    } else if (err.code === "23503") {
        res.status(400).send({msg: 'bad request', details: err.detail})
    } else {
        console.log(err);
        res.status(500).send("Server Error!");
    }
};