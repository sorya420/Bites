// create server
const express = require('express')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes')
const foodRoutes = require('./routes/food.routes')
const foodPartnerRoutes = require("./routes/food-partner.routes")
const orderRoutes = require("./routes/order.routes")
const cors = require('cors');



const app = express();

app.use(cors({
    origin:"https://bites-frontend-phi.vercel.app",
    credentials:true
}))
app.use(cookieParser());
app.use(express.json());



app.get("/",(req,res) => {
    res.send("Hello world");

})


app.use('/api/auth',authRoutes);
app.use("/api/food",foodRoutes);
app.use('/api/food-partner',foodPartnerRoutes)
app.use("/api/orders", orderRoutes)

module.exports = app;

