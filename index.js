"use strict"
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const expressHbs = require("express-handlebars");
const { createStarList } = require("./controllers/handleBarsHelpers")
const { createPagination } = require("express-handlebars-paginate");
const session = require("express-session");
const redisStore = require('connect-redis').default;
const { createClient } = require('redis');
const redisClient = createClient({
    //url: 'rediss://red-cserl53tq21c738g71ug:uYtYiVDUKBO4LkV8YHRGmOzN2hPyECc7@oregon-redis.render.com:6379'
    url: "redis://red-cserl53tq21c738g71ug:6379"
})
redisClient.connect().catch(console.error)

app.use(express.static(__dirname + "/html"));

app.engine("hbs", expressHbs.engine({
    layoutsDir: __dirname + "/views/layouts",
    defaultLayout: "layout",
    extname: "hbs",
    partialsDir: __dirname + "/views/partials",
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    },
    helpers: {
        createStarList,
        createPagination,
    }
}))
app.set("view engine", "hbs")

app.use(session({
    secret: 'S3cret', //Phat sinh Id co tung session
    store: new redisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 20 * 60 * 1000 // 20 phut
    }
}));

//Cau hinh phuong thuc post
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//middleware khoi tao gio hang
app.use((req, res, next) => {
    let Cart = require("./controllers/cart");
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.session.cart.quantity;
    next();
})
app.use("/products", require("./routes/productsRouter"))
app.use("/", require("./routes/indexRouter"));
app.use("/users", require("./routes/userRouter"));


app.use((req, res, next) => {
    res.status(404).render("error", { message: "File not found" });
});
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render("error", { message: "Internal Server Error" });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));