const db = require("../connect/database");

const addCart = (req, res) => {
  try {
    const { idproducts, idsize, idcolor } = req.body;
    const idusers = req.auth.id;
    const querySelect =
      "select * from products,size,color,cart where cart.idsize =? and cart.idcolor = ? and idusers = ?";
    const queryUpdate =
      "Update cart set quantity = ? where idsize = ? and idcolor = ?";
    const queryInsert =
      "Insert into cart(idproducts ,idsize,idcolor,idusers,quantity) values(?,?,?,?,1)";
    if (idproducts === "" || idsize === "" || idcolor === "") {
      res.status(400).json({
        message: "Please fill in all fields",
      });
    } else {
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng của người dùng hay chưa
      db.connection.query(
        querySelect,
        [idsize, idcolor, idusers],
        (error, result) => {
          if (error) throw error;
          if (result.length) {
            // // Sản phẩm đã tồn tại trong giỏ hàng, tăng số lượng lên
            const newQuantity = result[0].quantity + 1;
            db.connection.query(
              queryUpdate,
              [newQuantity, idsize, idcolor],
              (error) => {
                if (error) throw error;
                res.status(200).json({
                  result: {
                    ...result[0],
                    quantity: newQuantity,
                  },
                  message: "Updated quantity of product",
                });
              }
            );
          } else {
            // Sản phẩm chưa tồn tại trong giỏ hàng, thêm sản phẩm vào bảng cart
            db.connection.query(
              queryInsert,
              [idproducts, idsize, idcolor, idusers, 1],
              (error) => {
                if (error) throw error;
                res.status(200).json({ message: "Product added to cart" });
              }
            );
          }
        }
      );
    }
  } catch (error) {
    res.status(400).json("Error Server");
  }
};

const getCart = (req, res) => {
  try {
    const idusers = req.auth.id;
    const querySelect =
      "select * ,(SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color', (SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idsize = cart.idsize))) FROM size WHERE size.idsize = cart.idsize ) size,(SELECT JSON_ARRAYAGG(avt) FROM image WHERE image.idproducts = products.idproducts) image from products,cart where idusers = 4 and cart.idproducts = products.idproducts;";
    db.connection.query(querySelect, [idusers], (error, result) => {
      if (error) throw error;
      else {
        const arr = result.map((value) => {
          return {
            ...value,
            image: JSON.parse(value.image),
            size: JSON.parse(value.size),
          };
        });
        res.status(200).json(arr);
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

module.exports = {
  addCart,
  getCart,
};
