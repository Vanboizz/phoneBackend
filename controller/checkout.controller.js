const db = require("../connect/database");

const checkOut = (req, res) => {
  try {
    const { phonenumber, firstname, lastname, email, address, totalprice } = req.body;
    const idusers = req.auth.id;
    const querySelectCart =
      "select * ,(SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color',(SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idcolor = cart.idcolor))) FROM size WHERE size.idsize = cart.idsize ) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image WHERE image.idproducts = products.idproducts) image from products,cart where idusers = ? and cart.idproducts = products.idproducts;";
    const querySelect = "select * from users where idusers = ? ";
    const queryInsert =
      "insert into invoice(idusers,ivday,firstnamereceive,lastnamereceive,emailreceive,addressreceive,phonenumberreceive,statusiv,totalprice) values(?,now(),?,?,?,?,?,?,?)";
    const queryInsertInvoiceDetail =
      "insert into detailinvoice(idiv,idproducts,idsize,idcolor,idimage,price,quantity) values(?,?,?,?,?,?,?)";
    const querySelectQuantity =
      " SELECT color.idsize, color.idcolor, quantity from size,color where color.idsize = size.idsize and color.idsize = ? and color.idcolor = ?";
    const queryUpdateQuantity =
      "update color set quantity = ? where idsize = ? and idcolor = ?";
    db.connection.query(querySelect, [idusers], (error, result) => {
      if (error) throw error;
      if (result.length) {
        db.connection.query(
          queryInsert,
          [
            idusers,
            firstname,
            lastname,
            email,
            address,
            phonenumber,
            "UnPaid",
            totalprice,
            "Direct"
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
                  price = item.pricesize - ((item.pricesize * value.discount) / 100);
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
                  (error) => {
                    if (error) throw error;
                  }
                );
              });
            });
            // Lấy số lượng cart
            db.connection.query(querySelectCart, [idusers], (error, result) => {
              if (error) throw error;
              result.forEach((element) => {
                // Lấy số lượng tồn
                db.connection.query(
                  querySelectQuantity,
                  [element.idsize, element.idcolor],
                  (error, result) => {
                    if (error) throw error;
                    result.forEach((stock) => {
                      const a = stock.quantity - element.quantity;
                      db.connection.query(
                        queryUpdateQuantity,
                        [a, stock.idsize, stock.idcolor],
                        (error) => {
                          res.status(200).send();
                        }
                      );
                    });
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
      "select invoice.idiv, products.idproducts, invoice.ivday, invoice.totalprice, size.pricesize, products.discount , products.nameproducts,size.namesize,color.namecolor,image.avt,detailinvoice.price,detailinvoice.quantity,invoice.statusiv from detailinvoice,invoice,products,size,color,image where detailinvoice.idiv = invoice.idiv and products.idproducts = detailinvoice.idproducts and size.idsize = detailinvoice.idsize and color.idcolor = detailinvoice.idcolor and image.idimage = detailinvoice.idimage and invoice.idusers = ?";

    db.connection.query(querySelect, [idusers], (error, result) => {
      if (error) throw error;

      db.connection.query("select * from invoice where idusers = ?", [idusers], (error, ivdb) => {
        if (error) throw error;
        var arrayfilter = [];
        for (var i = 0; i < ivdb.length; i++) {
          var array = result.filter(data => data.idiv === ivdb[i].idiv);
          arrayfilter = [...arrayfilter, array];
        }
        res.status(200).json({ result: arrayfilter });
      })
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

const deteleCheckout = (req, res) => {
  try {
    const { idiv } = req.body
    const deletedtiv = "delete from detailinvoice where idiv = ?"
    const deleteiv = "delete from invoice where idiv = ?"

    db.connection.query(deletedtiv, [idiv], (error) => {
      if (error) throw error;
      db.connection.query(deleteiv, [idiv], error => {
        if (error) throw error
      })
      res.status(200).json({ message: "Delete order successfully" })
    })

  } catch (error) {
    res.status(400).json({ message: "Error server" })
  }
}

module.exports = {
  checkOut,
  getCheckOut,
  deteleCheckout
};
