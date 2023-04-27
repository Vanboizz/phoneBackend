const db = require("../connect/database");

const addCart = (req, res) => {
  try {
    const { idproducts, idsize, idcolor, idimage } = req.body;
    const idusers = req.auth.id;
    const querySelect =
      "select * from products,color,size,cart where cart.idsize = ? and cart.idcolor = ? and idusers = ?";
    const queryUpdate =
      "Update cart set quantity = ? where idsize = ? and idcolor = ?";
    const queryInsert =
      "Insert into cart(idproducts,idsize,idcolor,idimage,idusers,quantity) values(?,?,?,?,?,1)";
    if (
      idproducts === "" ||
      idsize === "" ||
      idcolor === "" ||
      idimage === ""
    ) {
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
          if (result.length > 0) {
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
              [idproducts, idsize, idcolor, idimage, idusers, 1],
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
      "select * ,(SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color',(SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idcolor = cart.idcolor))) FROM size WHERE size.idsize = cart.idsize ) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image WHERE image.idproducts = products.idproducts) image from products,cart where idusers = ? and cart.idproducts = products.idproducts;";
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

const deleteCart = (req, res) => {
  try {
    const { idsize, idcolor } = req.params;
    const idusers = req.auth.id;
    const querySelect =
      "select * from cart where idsize = ? and idcolor = ?  and idusers = ?";
    const queryDelete = "delete from cart where idsize = ? and idcolor = ?";
    // kiểm tra sản phẩm tồn tại trong giỏ hàng hay chưa
    db.connection.query(
      querySelect,
      [idsize, idcolor, idusers],
      (error, result) => {
        if (error) throw error;
        // nếu sản phẩm tồn tai trong giỏ hàng thì thực hiện xóa
        if (result.length > 0) {
          db.connection.query(queryDelete, [idsize, idcolor], (error) => {
            if (error) throw error;
            res.status(200);
          });
        }
      }
    );
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

const increaseQuantity = (req, res) => {
  try {
    const { idsize, idcolor } = req.body;
    const idusers = req.auth.id;
    const querySelect =
      "select * from cart where idsize = ? and idcolor = ? and idusers = ?";
    const queryUpdate =
      "Update cart set quantity = ? where idsize = ? and idcolor = ?";
    db.connection.query(
      querySelect,
      [idsize, idcolor, idusers],
      (error, result) => {
        if (error) throw error;
        if (result.length) {
          const increaseQuantity = result[0].quantity + 1;
          db.connection.query(
            queryUpdate,
            [increaseQuantity, idsize, idcolor],
            (error) => {
              if (error) throw error;
              res.status(200).json({
                result: {
                  ...result[0],
                  increaseQuantity: increaseQuantity,
                },
                message: "Update quantity is successfull",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

const decreaseQuantity = (req, res) => {
  try {
    const { idsize, idcolor } = req.body;
    const idusers = req.auth.id;
    const querySelect =
      "select * from cart where idsize = ? and idcolor = ? and idusers = ?";
    const queryUpdate =
      "Update cart set quantity = ? where idsize = ? and idcolor = ?";
    db.connection.query(
      querySelect,
      [idsize, idcolor, idusers],
      (error, result) => {
        if (error) throw error;
        if (result.length) {
          const decreaseQuantity = result[0].quantity - 1;
          db.connection.query(
            queryUpdate,
            [decreaseQuantity, idsize, idcolor],
            (error) => {
              if (error) throw error;
              res.status(200).json({
                result: {
                  ...result[0],
                  decreaseQuantity: decreaseQuantity,
                },
                message: "Update quantity is successfull",
              });
            }
          );
        }
      }
    );
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

const deleteAllCart = (req, res) => {
  try {
    const idusers = req.auth.id;
    const queryDelete = "delete from cart where idusers = ?";
    db.connection.query(queryDelete, [idusers], (error, result) => {
      if (error) throw error;
      res.status(200).json({ message: "Delete all cart is successfull" });
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};
module.exports = {
  addCart,
  getCart,
  deleteCart,
  increaseQuantity,
  decreaseQuantity,
  deleteAllCart,
};
