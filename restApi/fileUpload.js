const express = require('express')
// const joi = require('joi');
const file = require('../model/mongodb/file');
router = express();

router.post('/', async function (req, res) {
    console.log(req)
    if (req.files.file != null) {
        const extension = req.files.file.name.split(".")
        req.body.extension = extension[extension.length-1]
        req.body.fileName =req.files.file.name
        
        const uploaded = new file(req.body)
        var response = await uploaded.save()
        

        req.files.file.mv(`${__dirname}/files/${response._id}.${extension[extension.length-1]}`, function (err) {
            if (err) return res.send(err);
        })
        console.log(req.user,req.files,req.body,__dirname,response)
        return res.status(200).send({
            data: response
        })

    } else {
        return res.status(400).send("error")
    }
})

module.exports = router