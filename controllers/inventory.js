const InventoryModel = require('../schemas/inventory');

module.exports = {
    // 1. Get All (Join với Product)
    GetAll: async function () {
        return await InventoryModel.find().populate('product');
    },

    // 2. Get By ID (Join với Product)
    GetById: async function (id) {
        return await InventoryModel.findById(id).populate('product');
    },

    // 3. Add Stock (Tăng stock)
    AddStock: async function (productId, quantity) {
        let inv = await InventoryModel.findOne({ product: productId });
        if (!inv) throw new Error("Không tìm thấy kho của sản phẩm này");
        
        inv.stock += Number(quantity);
        await inv.save();
        return inv;
    },

    // 4. Remove Stock (Giảm stock)
    RemoveStock: async function (productId, quantity) {
        let inv = await InventoryModel.findOne({ product: productId });
        if (!inv) throw new Error("Không tìm thấy kho của sản phẩm này");
        if (inv.stock < quantity) throw new Error("Số lượng tồn kho không đủ để giảm");

        inv.stock -= Number(quantity);
        await inv.save();
        return inv;
    },

    // 5. Reservation (Giảm stock, Tăng reserved)
    Reservation: async function (productId, quantity) {
        let inv = await InventoryModel.findOne({ product: productId });
        if (!inv) throw new Error("Không tìm thấy kho của sản phẩm này");
        if (inv.stock < quantity) throw new Error("Không đủ tồn kho để đặt trước (reserve)");

        inv.stock -= Number(quantity);
        inv.reserved += Number(quantity);
        await inv.save();
        return inv;
    },

    // 6. Sold (Giảm reserved, Tăng soldCount)
    Sold: async function (productId, quantity) {
        let inv = await InventoryModel.findOne({ product: productId });
        if (!inv) throw new Error("Không tìm thấy kho của sản phẩm này");
        if (inv.reserved < quantity) throw new Error("Số lượng hàng đặt trước (reserved) không đủ để xuất bán");

        inv.reserved -= Number(quantity);
        inv.soldCount += Number(quantity);
        await inv.save();
        return inv;
    }
};