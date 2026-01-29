const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    const token = req.header('authorization')
    if (!token) return res.status(401).send({ 'data': {}, error: [{ 'message': 'Access denied.' }] });
    try {
        const decoded = jwt.verify(token, process.env.reception_Secret);
        req.user = decoded;
        console.log(decoded)
        next();
    } catch (err) {
        return res.status(401).send({ 'data': {}, error: [{ 'message': 'Access denied.' }] });
    }
}