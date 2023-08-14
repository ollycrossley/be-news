exports.errorHandler = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        console.log(err);
        res.status(500).send("Server Error!");
    }
};