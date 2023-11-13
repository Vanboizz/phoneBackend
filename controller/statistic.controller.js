const db = require("../connect/database");
const bcrypt = require("bcrypt");



const getMonthsRevenue = (req, res) => {
    try {
        const { year } = req.query;
        const query =
            `SELECT
                DATE_FORMAT(ivday, '%m') AS month,
                SUM(totalprice) AS monthly_revenue
            FROM
                invoice
            WHERE 
                statusiv = 'Paid'
                AND YEAR(ivday) = ${year}
            GROUP BY month
            ORDER BY month;
        `

        db.connection.query(query, (err, result) => {
            if (err) {
                throw err;
            } else {
                var newArray = [];
                for (let i = 1; i <= 12; i++) {
                    const monthData = result?.find(item => item.month === (i < 10 ? "0" + i.toString() : i.toString()))
                    monthData
                        ? newArray.push(monthData)
                        : newArray.push({ month: (i < 10 ? "0" + i.toString() : i.toString()), monthly_revenue: 0 })
                }
                res.status(200).json(newArray);
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server is error",
        });
    }
};


const getCateRevenue = (req, res) => {
    try {
        const { month, year } = req.query;
        const queryCate = 'select * from category'
        const query =
            `SELECT
                c.namecate AS brand,
                SUM(di.price * di.quantity) AS monthly_sales
            FROM
                invoice i, detailinvoice di, products p, category c
            WHERE
                i.idiv = di.idiv
                AND di.idproducts = p.idproducts
                AND p.idcate = c.idcate
                AND MONTH(i.ivday) = ${month}
                AND YEAR(i.ivday) = ${year}
                AND i.statusiv = 'Paid'
            GROUP BY
                brand
            ORDER BY
                monthly_sales DESC;
        `

        db.connection.query(queryCate, (err, listCate) => {
            if (err) {
                throw err;
            } else {
                db.connection.query(query, (err, result) => {
                    if (err) {
                        throw err;
                    } else {
                        var arrCateRevenue = [];
                        for (let i = 0; i < listCate.length; i++) {
                            const cateMatch = result.find(item => item?.brand === listCate[i]?.namecate)

                            cateMatch
                                ? arrCateRevenue.push(cateMatch)
                                : arrCateRevenue.push({ brand: listCate[i]?.namecate, monthly_sales: 0 })
                        }
                        res.status(200).json(arrCateRevenue);
                    }
                });
            }
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server is error",
        });
    }
};

const getTopSales = (req, res) => {
    try {
        const { year, month } = req.query;
        const queryImage = 'select * from image;'
        const query = `
        SELECT
            p.idproducts,
            p.nameproducts AS product_name,
            SUM(di.quantity) AS total_quantity
        FROM
            invoice i, detailinvoice di, products p
        WHERE
            i.idiv = di.idiv
            AND di.idproducts = p.idproducts
            AND MONTH(i.ivday) = ${month}
            AND YEAR(i.ivday) = ${year}
            AND i.statusiv = 'Paid'
        GROUP BY
            product_name, p.idproducts
        ORDER BY
            total_quantity DESC
        LIMIT 5;
        `

        db.connection.query(queryImage, (err, listImange) => {
            if (err) {
                throw err;
            } else {
                db.connection.query(query, (err, listTopSales) => {
                    if (err) {
                        throw err;
                    } else {
                        var newListTopSales = [];
                        for (var i = 0; i < listTopSales.length; i++) {
                            const result = listImange?.find(item => item?.idproducts === listTopSales[i].idproducts)
                            if (result) {
                                newListTopSales.push({ ...listTopSales[i], avt: result.avt })
                            }
                        }
                        res.status(200).json(newListTopSales);
                    }
                });
            }
        });



    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server is error",
        });
    }
};

module.exports = {
    getMonthsRevenue,
    getCateRevenue,
    getTopSales,
};