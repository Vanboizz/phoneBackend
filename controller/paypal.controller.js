const paypal = require("../paypal/paypal-api.js")

const createPayPalOrder = async (req, res) => {
    try {
        const order = await paypal.createOrder(req.body)
        res.json(order)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

const capturePayPalOrder = async (req, res) => {
    const { orderID, firstname, lastname, email, address, phonenumber, cost } = req.body
    const idusers = req.auth.id;
    try {
        const captureData = await paypal.capturePayment(orderID,  firstname, lastname, email, address, phonenumber, cost, idusers)
        res.json(captureData)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

module.exports = {
    createPayPalOrder,
    capturePayPalOrder
}