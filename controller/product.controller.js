const cloudinary = require("../utils/cloudinary");
const db = require("../connect/database");

const addProduct = (req, res) => {
  try {
    const {
      namecate,
      nameproducts,
      promotion,
      discount,
      description,
      sizes,
      images,
    } = req.body;
    //Query
    const insertCategory = "insert into category(namecate) values(?)";
    const insertProduct =
      "insert into products(idcate,nameproducts,promotion,discount,description) values(?,?,?,?,?)";
    const insertSize =
      "insert into size(idproducts,namesize,pricesize) values(?,?,?)";
    const insertColor =
      "insert into color(idsize,namecolor,quantity) values(?,?,?)";
    const insertImage =
      "insert into image(idproducts,avt,publicId) values(?,?,?)";

    db.connection.query(insertCategory, [namecate], (error, categoryResult) => {
      if (error) throw error;
      // Id category
      const categoryId = categoryResult.insertId;
      db.connection.query(
        insertProduct,
        [categoryId, nameproducts, promotion, discount, description],
        (error, productResult) => {
          if (error) throw error;
          //Id products
          const productsId = productResult.insertId;
          sizes.map((size) => {
            db.connection.query(
              insertSize,
              [productsId, size.namesize, size.pricesize],
              (error, sizeResult) => {
                if (error) throw error;
                const sizesId = sizeResult.insertId;
                size.colors.map((color) => {
                  db.connection.query(
                    insertColor,
                    [sizesId, color.namecolor, color.quantity],
                    (error, result) => {
                      if (error) throw error;
                    }
                  );
                });
              }
            );
          });
          images.map((image) => {
            cloudinary.uploader
              .upload(image, {
                upload_preset: "products",
              })
              .then((response) => {
                const publicIds = response.public_id;
                db.connection.query(
                  insertImage,
                  [productsId, image, publicIds],
                  (error, result) => {
                    if (error) throw error;
                  }
                );
              });
          });
        }
      );
    });
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const getProduct = (req, res) => {
  try {
    const query =
      "select products.idcate, products.idproducts,nameproducts,promotion, discount, description, (SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color', (SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor)) FROM color WHERE color.idsize = size.idsize))) FROM size WHERE size.idproducts = products.idproducts) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image  WHERE image.idproducts = products.idproducts) image from products, category where products.idcate = category.idcate";
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
  addProduct,
  getProduct,
};
