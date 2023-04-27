const db = require("../connect/database");

const checkOut = (req, res) => {
  try {
    const { phonenumber, fullname, email, address, totalprice } = req.body;
    const idusers = req.auth.id;
    const querySelectCart =
      "select * ,(SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color',(SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idcolor = cart.idcolor))) FROM size WHERE size.idsize = cart.idsize ) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image WHERE image.idproducts = products.idproducts) image from products,cart where idusers = ? and cart.idproducts = products.idproducts;";
    const querySelect = "select * from users where idusers = ? ";
    const queryInsert =
      "insert into invoice(idusers,ivday,fullnamereceive,emailreceive,addressreceive,phonenumberreceive,statusiv,totalprice) values(?,now(),?,?,?,?,?,?)";
    const queryInsertInvoiceDetail =
      "insert into detailinvoice(idiv,idproducts,idsize,idcolor,idimage,price,quantity) values(?,?,?,?,?,?,?)";
    db.connection.query(querySelect, [idusers], (error, result) => {
      if (error) throw error;
      if (result.length) {
        db.connection.query(
          queryInsert,
          [
            idusers,
            fullname,
            email,
            address,
            phonenumber,
            "UnPaid",
            totalprice,
          ],
          (error, result) => {
            if (error) throw error;
            const invoiceid = result.insertId;
            db.connection.query(querySelectCart, [idusers], (error, result) => {
              if (error) throw error;
              const data = result.map((value) => {
                return {
                  ...value,
                  image: JSON.parse(value.image),
                  size: JSON.parse(value.size),
                };
              });
              var price;
              data.map((value) => {
                value.size.map((item) => {
                  price = (item.pricesize * value.discount) / 100;
                  return price;
                });
                db.connection.query(
                  queryInsertInvoiceDetail,
                  [
                    invoiceid,
                    value.idproducts,
                    value.idsize,
                    value.idcolor,
                    value.idimage,
                    price,
                    value.quantity,
                  ],
                  (error, result) => {
                    if (error) throw error;
                    return res.status(200).send();
                  }
                );
              });
            });
          }
        );
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

const getCheckOut = (req, res) => {
  try {
    const idusers = req.auth.id;
    const querySelect =
      "select invoice.idiv,invoice.ivday,products.nameproducts,size.namesize,color.namecolor,image.avt,detailinvoice.price,detailinvoice.quantity,invoice.statusiv from detailinvoice,invoice,products,size,color,image where detailinvoice.idiv = invoice.idiv and products.idproducts = detailinvoice.idproducts and size.idsize = detailinvoice.idsize and color.idcolor = detailinvoice.idcolor and image.idimage = detailinvoice.idimage and invoice.idusers = ?";
    db.connection.query(querySelect, [idusers], (error, result) => {
      if (error) throw error;
      res.status(200).json({ result: result });
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

module.exports = {
  checkOut,
  getCheckOut,
};
