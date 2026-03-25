var express = require("express");
var router = express.Router();
let inventoryController = require('../controllers/inventory');

router.get('/', async (req, res) => {
    try {
        let data = await inventoryController.GetAll();
        res.send(data);
    } catch (err) { res.status(400).send(err.message); }
});

router.get('/:id', async (req, res) => {
    try {
        let data = await inventoryController.GetById(req.params.id);
        res.send(data);
    } catch (err) { res.status(400).send(err.message); }
});

router.post('/add_stock', async (req, res) => {
    try {
        let data = await inventoryController.AddStock(req.body.product, req.body.quantity);
        res.send({ message: "Nhập kho thành công", data });
    } catch (err) { res.status(400).send(err.message); }
});

router.post('/remove_stock', async (req, res) => {
    try {
        let data = await inventoryController.RemoveStock(req.body.product, req.body.quantity);
        res.send({ message: "Xuất kho thành công", data });
    } catch (err) { res.status(400).send(err.message); }
});

router.post('/reservation', async (req, res) => {
    try {
        let data = await inventoryController.Reservation(req.body.product, req.body.quantity);
        res.send({ message: "Đã đưa vào kho chờ giao (Reserved)", data });
    } catch (err) { res.status(400).send(err.message); }
});

router.post('/sold', async (req, res) => {
    try {
        let data = await inventoryController.Sold(req.body.product, req.body.quantity);
        res.send({ message: "Đã giao hàng thành công (Sold)", data });
    } catch (err) { res.status(400).send(err.message); }
});

module.exports = router;