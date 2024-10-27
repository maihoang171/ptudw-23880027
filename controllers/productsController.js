// const controller = {};
// const models = require("../models")

// controller.show = async(req, res) => {
//     res.locals.products = await models.Product.findAll({
//         attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"]
//     });
//     res.render("product-list");
// };

// module.exports = controller;

const controller = {};
const { where } = require("sequelize");
const models = require("../models")
const sequelize = require("sequelize")
const Op = sequelize.Op;
controller.getData = async(req, res, next) => {

    res.locals.categories = await models.Category.findAll({
        include: [{
            model: models.Product
        }]
    });
    res.locals.brands = await models.Brand.findAll({
        include: [{
            model: models.Product
        }]
    });
    res.locals.tags = await models.Tag.findAll();
    next();
}
controller.show = async(req, res) => {
    let categoryId = isNaN(req.query.categoryId) ? 0 : parseInt(req.query.categoryId);
    let brandId = isNaN(req.query.brandId) ? 0 : parseInt(req.query.brandId);
    let tagId = isNaN(req.query.tagId) ? 0 : parseInt(req.query.tagId);
    let keyword = req.query.keyword || "";
    let sort = ["priceLowToHigh", "priceHighToLow", "newest", "popular"].includes(req.query.sort) ? req.query.sort : "price";
    let options = {
        attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
        where: {}
    }
    if (categoryId > 0) {
        options.where.categoryId = categoryId;
    }
    if (brandId > 0) {
        options.where.brandId = brandId;
    }
    if (tagId > 0) {
        options.include = [{
            model: models.Tag,
            where: { id: tagId }
        }]
    }
    if (keyword.trim() != "") {
        options.where.name = {
            [Op.iLike]: `%${keyword}%`
        }
    }
    switch (sort) {
        case 'newest':
            options.order = [
                ['createdAt', 'DESC']
            ];
            break;
        case 'popular':
            options.order = [
                ['stars', 'DESC']
            ];
            break;
        case 'priceLowToHigh':
            options.order = [
                ['price', 'ASC']
            ];
            break;
        default:
            options.order = [
                ['price', 'DESC']
            ];
    }
    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let limit = 6;
    let offset = (page - 1) * limit;
    let products = await models.Product.findAll(options);

    res.locals.sort = sort;
    res.locals.originalUrl = removeParam("sort", req.originalUrl)
    if (Object.keys(req.query).length == 0) {
        res.locals.originalUrl = res.locals.originalUrl + "?";
    }
    res.locals.pagination = {
        page,
        limit,
        totalRows: products.length,
        queryParams: req.query,
    }
    res.locals.products = products.slice(offset, offset + limit);
    res.render("product-list")
}

controller.showDetail = async(req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id)
    let product = await models.Product.findOne({
        attributes: ["id", "name", "stars", "price", "oldPrice", "summary", "description", "specification"],
        where: { id },
        include: [{
            model: models.Image,
            attributes: ["name", "imagePath"]
        }, {
            model: models.Review,
            attributes: ["review", "stars", "createdAt"],
            include: [{
                model: models.User,
                attributes: ["firstName", "lastName"]
            }]
        }, {
            model: models.Tag,
            attributes: ["id"]
        }]
    })
    res.locals.product = product
    let tagIds = [];
    product.Tags.forEach(tag => tagIds.push(tag.id));

    res.locals.relatedProducts = await models.Product.findAll({
        attributes: ["id", 'name', 'imagePath', 'oldPrice', 'price', 'stars'],
        include: [{
            model: models.Tag,
            attributes: ["id"],
            where: {
                id: {
                    [Op.in]: tagIds
                }
            }
        }]

    })
    res.render("product-detail")
}

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}
module.exports = controller;