exports.errorHandler = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else if (err.code === "22P02") {
        res.status(400).send({ msg: 'invalid id' });
    } else {
        console.log(err);
        res.status(500).send("Server Error!");
    }
};