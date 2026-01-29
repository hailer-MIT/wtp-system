const express = require('express')
const reception = require('../model/mongodb/reception');
const designer = require('../model/mongodb/designer');
const workShop = require('../model/mongodb/workShop');
const manager = require('../model/mongodb/manager');
const cashier = require('../model/mongodb/cashier');
const accountant = require('../model/mongodb/accountant');
const inventoryClerk = require('../model/mongodb/inventoryClerk');
router = express();

router.post('/', async function (req, res) {
    console.log(req)
    if (req.files.file != null) {
        const extension = req.files.file.name.split(".")
        req.body.extension = extension[extension.length-1]
        req.body.fileName = req.files.file.name
        
        // Get user role and ID from request (set by auth middleware)
        const userRole = req.user.role;
        const userId = req.user.id;
        
        // Determine which model to use based on role
        let UserModel;
        switch(userRole) {
            case 'Reception':
                UserModel = reception;
                break;
            case 'Designer':
                UserModel = designer;
                break;
            case 'WorkShop':
                UserModel = workShop;
                break;
            case 'Manager':
                UserModel = manager;
                break;
            case 'Cashier':
                UserModel = cashier;
                break;
            case 'Accountant':
                UserModel = accountant;
                break;
            case 'InventoryClerk':
                UserModel = inventoryClerk;
                break;
            default:
                return res.status(400).send({ error: "Invalid user role" });
        }
        
        // Save file
        const filePath = `${__dirname}/profilePhotos/${userId}.${extension[extension.length-1]}`;
        req.files.file.mv(filePath, async function (err) {
            if (err) return res.status(500).send(err);
            
            // Update user's photo field with file path or URL
            const photoUrl = `/profilePhoto/${userId}.${extension[extension.length-1]}`;
            await UserModel.findByIdAndUpdate(userId, { photo: photoUrl });
            
            return res.status(200).send({
                data: { photo: photoUrl }
            });
        });
    } else {
        return res.status(400).send("error")
    }
})

module.exports = router

