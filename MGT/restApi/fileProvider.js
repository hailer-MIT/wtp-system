const express = require('express')
const fs = require('fs')

router = express();

router.get('/:file', async function (req, res) {
    const path = `${__dirname}/files/${req.params.file}`
    console.log(path)
    if (fs.existsSync(path)) {
        var filestream = fs.createReadStream(path);
        filestream.pipe(res);
    } else {
        return res.status(400).send("error")
    }
})

module.exports = router