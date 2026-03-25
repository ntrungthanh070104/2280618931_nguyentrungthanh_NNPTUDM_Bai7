var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let productModel = require('../schemas/products');

// BƯỚC 1: Gọi Model Kho hàng (Inventory) vào đây
let InventoryModel = require('../schemas/inventory');

//R CUD
/* GET users listing. */
router.get('/', async function (req, res, next) {
  let queries = req.query;
  let titleQ = queries.title ? queries.title.toLowerCase() : '';
  let min = queries.minprice ? queries.minprice : 0;
  let max = queries.maxprice ? queries.maxprice : 10000;
  console.log(queries);
  let data = await productModel.find({
    isDeleted: false,
    title: new RegExp(titleQ,'i'),
    price:{
      $gte: min,
      $lte: max
    }
  }).populate({
    path: 'category',
    select: 'name'
  })
  res.send(data);
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.find({
      isDeleted: false,
      _id: id
    })
    if (result.length > 0) {
      res.send(result[0])
    } else {
      res.status(404).send("ID NOT FOUND")
    }
  } catch (error) {
    res.status(404).send(error.message)
  }

});

router.post('/', async function (req, res, next) {
  try {
    let newProduct = new productModel({
      title: req.body.title,
      slug: slugify(req.body.title,
        {
          replacement: '-',
          remove: undefined,
          lower: true,
          trim: true
        }
      ), price: req.body.price,
      images: req.body.images,
      description: req.body.description,
      category: req.body.category
    })
    
    // Lưu Product vào database trước
    await newProduct.save();

    // BƯỚC 2: TỰ ĐỘNG TẠO INVENTORY TƯƠNG ỨNG
    // Lấy ID của Product vừa tạo gán vào trường product của Inventory
    let newInventory = new InventoryModel({
        product: newProduct._id, 
        stock: 0,
        reserved: 0,
        soldCount: 0
    });
    await newInventory.save();

    res.send(newProduct);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findByIdAndUpdate(
      id, req.body, {
      new: true
    })
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findById(id)
    result.isDeleted = true;
    await result.save()
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})

module.exports = router;