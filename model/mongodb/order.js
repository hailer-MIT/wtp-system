const { Schema, model } = require('mongoose')
const counter = require('./counter')

module.exports = model('Orders', new Schema({
    orderNumber: Number,
    customerName: String,
    contactPerson: { type: String, trim: true, required: true },
    phoneNumber: { type: Number, required: true },
    tinNumber: Number,
    email: String,
    fullPayment: { type: Number, required: true },
    advancePayment: { type: Number, required: true },
    remainingPayment: { type: Number, required: true },
    services: [{
        service: { type: Schema.Types.ObjectId, ref: "Services", required: true },
        jobDescription: { type: String, required: true },
        material: String,
        size: String,
        progress: { type: String, trim: true, default: "Pending" },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        completedFilesId: [{ type: Schema.Types.ObjectId, ref: "Files", required: true }],
    }],
    receivedBy: { type: Schema.Types.ObjectId, ref: "Receptions", required: true },
    files: [{ type: Schema.Types.ObjectId, ref: "Files", required: true }],

    designedBy: { type: Schema.Types.ObjectId, ref: "Designers" },
    workShop: { type: Schema.Types.ObjectId, ref: "WorkShops" },
    orderedDate: { type: Date, default: Date.now() },
    deliveryDate: { type: Date, required: true },
    progress: { type: String, trim: true },
    assignmentStatus: { type: String, trim: true, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    rejectionReason: { type: String, trim: true },
    satisfactionRate: Number,
    feedback: [String],
    otherFeedback: String,
    edited: { type: Boolean, default: false },
    pendingDate: Date,
    pendingDate: Date,
    designingStartDate: Date,
    designerCompletedDate: Date,
    waitingForPrintDate: Date,
    printingDate: Date,
    completedDate: Date,
    deliveredDate: Date,
    rejectedDate: Date,
    reassignedDate: Date,
    editedFile: [{
        customerName: String,
        contactPerson: { type: String, trim: true, required: true },
        phoneNumber: { type: Number, required: true },
        tinNumber: Number,
        email: String,
        fullPayment: { type: Number, required: true },
        advancePayment: { type: Number, required: true },
        remainingPayment: { type: Number, required: true },
        designedBy: { type: Schema.Types.ObjectId, ref: "Designers" },
        workShop: { type: Schema.Types.ObjectId, ref: "WorkShops" },
    }]


}).pre('save', function (next) {
    var doc = this;
    counter.findByIdAndUpdate({ _id: 'order' }, { $inc: { seq: 1 } }, async function (error, counterR) {
        console.log(counterR)
        if (error)
            return next(error);

        if (counterR == null) {
            const create = new counter({ _id: 'order', seq: 0 })
            await create.save()
            doc.orderNumber = counterR.seq;
            return next();
        }
        doc.orderNumber = counterR.seq;
        next();
    });
}))



// Servises [ {Servise id jobDiscription, Material, Size, quantity} ]
// Files[ {file location, description, for} ]