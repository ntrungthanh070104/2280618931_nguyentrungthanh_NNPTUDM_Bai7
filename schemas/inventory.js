const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'product', // Phải khớp với tên model Product của bạn
        required: true, 
        unique: true 
    },
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('inventory', inventorySchema);