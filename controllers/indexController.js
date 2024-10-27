"use strict";
const controller = {};
const models = require("../models");
controller.showHomepage = async(req, res) => {
    res.locals.recentProducts = await models.Product.findAll({
        attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice", "createdAt"],
        order: [
            ["createdAt", "DESC"]
        ],
        limit: 10,
    })
    res.locals.featuredProducts = await models.Product.findAll({
        attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
        order: [
            ["stars", "DESC"]
        ],
        limit: 10,
    });
    res.locals.categories = await models.Category.findAll();
    res.locals.brands = await models.Brand.findAll();
    res.render("index")
}

controller.showPage = (req, res, next) => {
    const pages = ["cart", "checkout", "contact", "login", "my-account", "product-detail", "product-list", "wish-list "]
    if (pages.includes(req.params.page))
        return res.render(req.params.page);
    next()
    res.render(req.params.page)
}
module.exports = controller;