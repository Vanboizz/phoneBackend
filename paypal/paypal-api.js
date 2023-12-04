const axios = require('axios');
const base = "https://api-m.sandbox.paypal.com";
const db = require("../connect/database.js")

/**
 * Create an order
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (data) => {
    try {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;

        const requestData = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: data.product.cost,
                    },
                },
            ],
        };

        const response = await axios.post(url, requestData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return handleResponse(response);
    } catch (error) {
        // Handle errors here
        console.error(error);
        throw error;
    }
};


/**
 * Capture payment for an order
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const capturePayment = async (orderId, firstname, lastname, email, address, phonenumber, cost, idusers) => {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const querySelectCart =
        "select * ,(SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color',(SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idcolor = cart.idcolor))) FROM size WHERE size.idsize = cart.idsize ) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image WHERE image.idproducts = products.idproducts) image from products,cart where idusers = ? and cart.idproducts = products.idproducts;";
    const querySelect = "select * from users where idusers = ? ";
    const queryInsert =
        "insert into invoice(idusers,ivday,firstnamereceive,lastnamereceive, emailreceive,addressreceive,phonenumberreceive,statusiv,totalprice,type) values(?,now(),?,?,?,?,?,?,?,?)";
    const queryInsertInvoiceDetail =
        "insert into detailinvoice(idiv,idproducts,idsize,idcolor,idimage,price,quantity) values(?,?,?,?,?,?,?)";
    const querySelectQuantity =
        "SELECT color.idsize, color.idcolor, quantity from size,color where color.idsize = size.idsize and color.idsize = ? and color.idcolor = ?";
    const queryUpdateQuantity =
        "update color set quantity = ? where idsize = ? and idcolor = ?";
    const config = { // Đặt cấu hình trong một đối tượng config
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    };

    const response = await axios.post(url, null, config); // Truyền null làm dữ liệu vì không có dữ liệu được gửi

    if (response.data.status === "COMPLETED") {
        const selectQueryResult = await new Promise((resolve, reject) => {
            db.connection.query(querySelect, [idusers], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        if (selectQueryResult.length) {
            const insertResult = await new Promise((resolve, reject) => {
                db.connection.query(
                    queryInsert,
                    [
                        idusers,
                        firstname,
                        lastname,
                        email,
                        address,
                        phonenumber,
                        "Paid",
                        cost,
                        "Online",
                    ],
                    (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    }
                );
            });

            const invoiceid = insertResult.insertId;

            const cartQueryResult = await new Promise((resolve, reject) => {
                db.connection.query(querySelectCart, [idusers], (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                });
            });

            for (const value of cartQueryResult) {
                const data = {
                    ...value,
                    image: JSON.parse(value.image),
                    size: JSON.parse(value.size),
                };

                for (const item of data.size) {
                    const price = item.pricesize - ((item.pricesize * data.discount) / 100);

                    await new Promise((resolve, reject) => {
                        db.connection.query(
                            queryInsertInvoiceDetail,
                            [
                                invoiceid,
                                data.idproducts,
                                item.idsize,
                                data.idcolor,
                                data.idimage,
                                price,
                                data.quantity,
                            ],
                            (error) => {
                                if (error) reject(error);
                                resolve();
                            }
                        );
                    });

                    const stockQueryResult = await new Promise((resolve, reject) => {
                        db.connection.query(
                            querySelectQuantity,
                            [item.idsize, data.idcolor],
                            (error, result) => {
                                if (error) reject(error);
                                resolve(result);
                            }
                        );
                    });

                    for (const stock of stockQueryResult) {
                        const a = stock.quantity - data.quantity;

                        await new Promise((resolve, reject) => {
                            db.connection.query(
                                queryUpdateQuantity,
                                [a, stock.idsize, stock.idcolor],
                                (error) => {
                                    if (error) reject(error);
                                    resolve();
                                }
                            );
                        });
                    }
                }
            }
        }
    } {
        return handleResponse(response);
    }
}

/**
 * Generate an OAuth 2.0 access token
 * @see https://developer.paypal.com/api/rest/authentication/
 */
const generateAccessToken = async () => {
    const auth = Buffer.from(
        process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
    ).toString("base64");

    const requestData = "grant_type=client_credentials";

    const config = {
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };

    const response = await axios.post(`${base}/v1/oauth2/token`, requestData, config);

    const jsonData = await handleResponse(response);
    return jsonData.access_token;
}
/**
 * Generate a client token
 * @see https://developer.paypal.com/docs/checkout/advanced/integrate/#link-sampleclienttokenrequest
 */
const generateClientToken = async () => {
    const accessToken = await generateAccessToken();

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Accept-Language": "en_US",
            "Content-Type": "application/json",
        },
    };

    const response = await axios.post(`${base}/v1/identity/generate-token`, null, config);

    const jsonData = await handleResponse(response);
    return jsonData.client_token;
}

const handleResponse = (response) => {
    if (response.status >= 200 && response.status <= 299) {
        return response.data; // Trả về dữ liệu JSON khi thành công
    } else {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
};
module.exports = {
    handleResponse,
    generateClientToken,
    generateAccessToken,
    capturePayment,
    createOrder
}