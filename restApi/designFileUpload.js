const express = require("express");
// const joi = require('joi');
const file = require("../model/mongodb/file");
const order = require("../model/mongodb/order");
router = express();

router.post("/:orderId/:index", async function (req, res) {
  if (req.files.file != null) {
    const extension = req.files.file.name.split(".");
    req.body.extension = extension[extension.length - 1];
    req.body.fileName = req.files.file.name;
    req.body.for = "design file";
    const uploaded = new file(req.body);
    var response = await uploaded.save();
    var obj = {};
    console.log(req.params);
    // obj["services"][`${}`]["completedFilesId"] = response._id;
    var text = `services.${req.params.index}.completedFilesId`
    obj[text] = response._id

    var update = await order.findByIdAndUpdate(req.params.orderId, {
      $push: obj,
    });
    req.files.file.mv(
      `${__dirname}/files/${response._id}.${extension[extension.length - 1]}`,
      function (err) {
        if (err) return res.send(err);
      }
    );
    console.log(req.user, req.files, req.body, __dirname, response);
    return res.status(200).send({
      data: update,
    });
  } else {
    return res.status(400).send("error");
  }
});

module.exports = router;
