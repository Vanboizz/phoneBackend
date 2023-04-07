const cloudinary = require("../utils/cloudinary");
const db = require("../connect/database");

const addCategory = (req, res) => {
  try {
    const { namecate } = req.body;
    const query = "insert into category(namecate) values(?)";
    if (namecate === "") {
      res.status(400).json({
        message: "Please fill in all fields",
      });
    } else {
      db.connection.query(query, [namecate], (error, result) => {
        if (error) {
          res.status(400).json({ message: "Error" });
        } else {
          res.status(200).json({ message: "Add is successfull" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const addProduct = (req, res) => {
  try {
    const { idcate, nameproducts, promotion, quantity, discount, description } =
      req.body;
    const value = [
      idcate,
      nameproducts,
      promotion,
      quantity,
      discount,
      description,
    ];
    const query =
      "insert into products(idcate,nameproducts,promotion,quantity,discount,description) values(?,?,?,?,?,?)";
    if (
      idcate === "" ||
      nameproducts === "" ||
      (promotion === "") | (quantity === "") ||
      discount === "" ||
      description === ""
    ) {
      res.status(400).json({
        message: "Please fill in all fields",
      });
    } else {
      db.connection.query(query, value, (error) => {
        if (error) {
          res.status(400).json({
            message: "Not exists category",
          });
        } else {
          res.status(200).json({ message: "Add is successfull" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const addImage = (req, res) => {
  try {
    const { idproducts, avt } = req.body;
    const query = "insert into image(idproducts,avt,publicId) values(?,?,?)";
    if (idproducts === "" || avt === "") {
      res.status(400).json({
        message: "Please fill in all fields",
      });
    } else {
      cloudinary.uploader
        .upload(avt, {
          upload_preset: "products",
        })
        .then((response) => {
          const publicId = response.public_id;
          const value = [idproducts, avt, publicId];
          db.connection.query(query, value, (error, result) => {
            if (error) {
              res.status(400).json({
                message: "Not exists product",
              });
            } else {
              res.status(200).json({ message: "Add image is successfull" });
            }
          });
        })
        .catch((error) => {
          res.status(400).json({ message: "Error server" });
        });
    }
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const addSize = (req, res) => {
  try {
    const { idproducts, namesize, pricesize } = req.body;
    const query =
      "insert into size(idproducts,namesize,pricesize) values(?,?,?)";
    if (idproducts === "" || namesize === "" || pricesize === "") {
      res.status(400).json({ message: "Please fill in all fields" });
    } else {
      db.connection.query(
        query,
        [idproducts, namesize, pricesize],
        (error, result) => {
          if (error) {
            res.status(400).json({ message: "Not exists products" });
          } else {
            res.status(200).json({ message: "Add is successfully" });
          }
        }
      );
    }
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const addColor = (req, res) => {
  try {
    const { idsize, namecolor } = req.body;
    const query = "insert into color(idsize,namecolor) values(?,?)";
    if (idsize === "" || namecolor === "") {
      res.status(400).json({ message: "Please fill in all fields" });
    } else {
      db.connection.query(query, [idsize, namecolor], (error, result) => {
        if (error) {
          res.status(400).json({ message: "Not exists sizes" });
        } else {
          res.status(200).json({ message: "Add is successfully" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const getProduct = (req, res) => {
  try {
    const query =
      "select products.idcate, products.idproducts,nameproducts,promotion, discount, description, (SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color', (SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idsize = size.idsize))) FROM size WHERE size.idproducts = products.idproducts) size,(SELECT JSON_ARRAYAGG(avt) FROM image WHERE image.idproducts = products.idproducts) image from products, category where products.idcate = category.idcate";
    db.connection.query(query, (err, result) => {
      if (err) {
        throw err;
      } else {
        const arr = result.map((value) => {
          return {
            ...value,
            size: JSON.parse(value.size),
            image: JSON.parse(value.image),
          };
        });
        res.status(200).json(arr);
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

module.exports = {
  addCategory,
  addProduct,
  addImage,
  addSize,
  addColor,
  getProduct,
};
