const cloudinary = require("../utils/cloudinary");
const db = require("../connect/database");
const jwt = require("jsonwebtoken")
require("dotenv").config();

const addProduct = (req, res) => {
  try {
    const {
      selectedcategory,
      nameproducts,
      promotion,
      discount,
      description,
      sizes,
      images,
    } = req.body;

    const insertProduct =
      "insert into products(idcate,nameproducts,promotion,discount,description) values(?,?,?,?,?)";
    const insertSize =
      "insert into size(idproducts,namesize,pricesize) values(?,?,?)";
    const insertColor =
      "insert into color(idsize,namecolor,quantity) values(?,?,?)";
    const insertImage =
      "insert into image(idproducts,avt,publicId) values(?,?,?)";
    db.connection.query(
      insertProduct,
      [selectedcategory, nameproducts, promotion, discount, description],
      (error, productResult) => {
        if (error) throw error;

        const productsId = productResult.insertId;

        sizes.map((size) => {
          db.connection.query(
            insertSize,
            [productsId, size.namesize, size.pricesize],
            (error, sizeResult) => {
              if (error) throw error;
              const sizesId = sizeResult.insertId;
              size.color.map((color) => {
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
    res.status(200);
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      selectedcategory,
      idproducts,
      nameproducts,
      promotion,
      discount,
      description,
      sizes,
      images,
    } = req.body;
    //Query
    const deleteCart = "delete from cart where idcolor = ?"
    const updateProduct =
      "update products set  idcate = ?,nameproducts = ? ,promotion = ? ,discount = ?, description = ? where idproducts = ?"

    const insertColor =
      "insert into color(idsize,namecolor,quantity) values(?,?,?)";
    const selectColor =
      "select * from color where idsize =? "
    const updateColor =
      "update color set namecolor = ?, quantity = ? where idcolor = ?";
    const deleteColor =
      "delete from color where idcolor = ?"

    const insertSize =
      "insert into size(idproducts,namesize,pricesize) values(?,?,?)";
    const updateSize =
      "update size set namesize = ?, pricesize = ? where idsize = ?";
    const selectSize =
      "select * from size where idproducts = ?"

    const updateImage =
      "update image set avt = ?, publicId = ? where idimage = ?";
    const selectImage =
      "select * from image where idproducts = ?"
    const deleteImage =
      "Delete from image where idimage = ?"
    const insertImage =
      "insert into image(idproducts,avt,publicId) values(?,?,?)";
    let check = true;

    // Update image
    db.connection.query(selectImage, [idproducts], (error, imagesdb) => {
      if (error) {
        check = false
        throw error
      }
      else {
        if (imagesdb.length >= images.length) {
          imagesdb.map((imagedb, i) => {
            if ((i < images.length) && (images[i].avt !== imagedb.avt)) {

              cloudinary.uploader.destroy(imagedb.publicId);
              
              cloudinary.uploader
                .upload(images[i].avt, {
                  upload_preset: "products",
                })
                .then((response) => {
                  const publicId = response.public_id;
                  db.connection.query(
                    updateImage,
                    [images[i].avt, publicId, images[i].idimage],
                    (error, result) => {
                      if (error) {
                        check = false
                        throw error
                      };
                    }
                  );
                });
            }
            else if (i >= images.length) { // Delete image 
              cloudinary.uploader.destroy(imagesdb[i].publicId);
              db.connection.query(
                deleteImage,
                [imagesdb[i].idimage],
                (error, result) => {
                  if (error) {
                    check = false
                    throw error
                  };
                }
              )
            }
          })
        }
        else {
          images.map((image, i) => {
            if ((i < imagesdb.length) && (image.avt !== imagesdb[i].avt)) {
              cloudinary.uploader.destroy(imagesdb[i].publicId);
              cloudinary.uploader
                .upload(image.avt, {
                  upload_preset: "products",
                })
                .then((response) => {
                  const publicId = response.public_id;
                  db.connection.query(
                    updateImage,
                    [image.avt, publicId, image.idimage],
                    (error, result) => {
                      if (error) {
                        check = false
                        throw error
                      };
                    }
                  );
                });
            }
            else if (i >= imagesdb.length) {
              cloudinary.uploader
                .upload(image.avt, {
                  upload_preset: "products",
                })
                .then((response) => {
                  const publicIds = response.public_id;
                  db.connection.query(
                    insertImage,
                    [idproducts, image.avt, publicIds],
                    (error, result) => {
                      if (error) {
                        check = false
                        throw error
                      };
                    }
                  );
                });
            }
          })
        }
      }
    })

    // update product 
    if (check) {
      db.connection.query("select * from products where idproducts = ?", [idproducts], (error, productdb) => {
        if (error) throw error
        else {
          if (productdb[0].idcate != selectedcategory || productdb[0].nameproducts != nameproducts || productdb[0].promotion != promotion || productdb[0].discount != discount || productdb[0].description != description) {
            db.connection.query(
              updateProduct,
              [selectedcategory, nameproducts, promotion, discount, description, idproducts],
              (error, productResult) => {
                if (error) {
                  check = false
                  throw error
                };
                // update products
              })
          }
        }
      })
    }

    // Update size 
    if (check) {
      db.connection.query(selectSize, [idproducts], (error, sizesdb) => {
        if (error) {
          check = false
          throw error
        };
        sizes.map((size, i) => {
          if (size.idsize !== '') {
            // Update size có id 
            if (size.namesize !== sizesdb[i].namesize || size.pricesize !== sizesdb[i].pricesize) {
              db.connection.query(
                updateSize,
                [size.namesize, size.pricesize, size.idsize],
                (error) => {
                  if (error) {
                    check = false
                    throw error
                  };
                })
            }
          }
          else {
            // Create new size 
            db.connection.query( // create update Size 
              insertSize,
              [idproducts, size.namesize, size.pricesize],
              (error, sizeresult) => {
                if (error) {
                  check = false
                  throw error
                };

                if (size.color !== null) {
                  size.color.map((color, j) => {
                    db.connection.query( // insert'-update color successfully
                      insertColor,
                      [sizeresult.insertId, color.namecolor, color.quantity],
                      (error, result) => {
                        if (error) {
                          check = false
                          throw error
                        };
                      }
                    );
                  })
                }
              })
          }
        })
      })
    }

    // Udpate color (delete color) 
    if (check) {
      sizes.map((size, i) => {
        if (size.idsize !== '') {
          db.connection.query(selectColor, [size.idsize], (error, colorsdb) => {
            if (error) {
              check = false
              throw error
            };
            if (size.color.length <= colorsdb.length) {
              colorsdb.map((colordb, j) => {
                if (j < size.color.length) { // update color có id                
                  db.connection.query(
                    updateColor,
                    [size.color[j].namecolor, size.color[j].quantity, size.color[j].idcolor],
                    (error, colorResult) => {
                      if (error) {
                        check = false
                        throw error
                      };
                    })
                }
                else { // delete color redundant

                  const selectCart = "select * from cart";
                  const selectdetailiv = "select * from detailinvoice";

                  db.connection.query(selectdetailiv, (error, detailiv) => {
                    if (error) {
                      check = false
                      throw error
                    };
                    const foundcolorindetail = detailiv.find(itemiv => itemiv.idcolor === colorsdb[j].idcolor);
                    if (foundcolorindetail) {
                      check = false
                      return;
                      // throw error
                    }
                    else (
                      db.connection.query(selectCart, (error, cartdb) => {
                        if (error) {
                          check = false
                          throw error
                        };
                        const foundidcolor = cartdb.find(itemcart => itemcart.idcolor === colorsdb[j].idcolor)
                        if (foundidcolor) { // tìm thấy trong cart,                                       
                          db.connection.query( // delete cart belong to
                            deleteCart,
                            [colorsdb[j].idcolor],
                            (error, cartResult) => {
                              if (error) {
                                check = false;
                                throw error;
                              }
                            })
                        }
                        db.connection.query( // delete color redundant 
                          deleteColor,
                          [colorsdb[j].idcolor],
                          (error, colorResult) => {
                            // if (error) throw error
                            if (error) {
                              check = false
                              throw error
                            };
                          })

                      })
                    )
                  })
                }
              })
            }
            else {
              size.color.map((color, i) => {
                if (i < colorsdb.length) {
                  db.connection.query( // update color have id 
                    updateColor,
                    [color.namecolor, color.quantity, color.idcolor],
                    (error, colorResult) => {
                      if (error) {
                        check = false
                        throw error
                      };
                    })
                }
                else {
                  db.connection.query( // insert'-update color 
                    insertColor,
                    [size.idsize, color.namecolor, color.quantity],
                    (error, result) => {
                      if (error) {
                        check = false
                        throw error
                      };
                    }
                  );
                }
              })
            }
          })
        }
      })
    }

    if (check == true) {
      res.status(200).json({
        message: 'Update product successfully!'
      })
    }
    else {
      res.status(400).json({
        message: 'Update product failed!'
      })
    }
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const getProduct = (req, res) => {
  try {
    const query =
      "select products.idproducts, products.idcate,nameproducts,promotion, discount, description, (SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color', (SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor,'quantity',quantity)) FROM color WHERE color.idsize = size.idsize))) FROM size WHERE size.idproducts = products.idproducts) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image  WHERE image.idproducts = products.idproducts) image from products, category where products.idcate = category.idcate ORDER BY products.idproducts ASC;";
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

const getProductDetail = (req, res) => {
  try {
    const idproducts = req.params.idproducts;
    const selectProductsById = "SELECT products.idcate, products.idproducts, nameproducts, promotion, discount, description, (SELECT json_arrayagg(JSON_OBJECT('namesize', namesize, 'pricesize', pricesize, 'idsize', idsize, 'color', (SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor', idcolor, 'namecolor', namecolor, 'quantity', quantity)) FROM color WHERE color.idsize = size.idsize))) FROM size WHERE size.idproducts = products.idproducts) size, (SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage', idimage, 'avt', avt)) FROM image WHERE image.idproducts = products.idproducts) image FROM products WHERE products.idproducts = ?";

    const selectListFavourite = "SELECT * FROM favorite WHERE favorite.idproducts = ? AND idusers = ?";
    let isHeart = false;
    let token = req.headers['authorization'];

    // Thực hiện truy vấn để lấy thông tin sản phẩm
    db.connection.query(selectProductsById, [idproducts], (error, result) => {
      if (error) {
        throw error;
      } else {
        const response = {
          ...result[0],
          size: JSON.parse(result[0].size),
          image: JSON.parse(result[0].image),
          isHeart
        };

        // Nếu có token và đã đăng nhập, thực hiện truy vấn danh sách yêu thích
        if (token) {
          token = token.slice(7);
          jwt.verify(token, process.env.APP_ACCESS_TOKEN, (error, decoded) => {
            if (!error) {
              db.connection.query(selectListFavourite, [idproducts, decoded.idusers], (error, favoriteResult) => {
                if (error) throw error;
                if (favoriteResult && favoriteResult.length !== 0) {
                  response.isHeart = true; // Người dùng đã thích sản phẩm
                }
                res.status(200).json(response);
              });
            } else {
              // Lỗi xác minh token, trả về sản phẩm mà không cho phép thích
              res.status(200).json(response);
            }
          });
        } else {
          // Không có token, trả về sản phẩm mà không cho phép thích
          res.status(200).json(response);
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
}

const getCategory = (req, res) => {
  try {
    const selectCategory = "select * from category";
    db.connection.query(selectCategory, (error, result) => {
      if (error) throw err;
      res.status(200).json(result);
    });
  } catch (error) {
    res.status(400).json({ message: "Error server" });
  }
};

const getCategorybyID = (req, res) => {
  try {
    const idcate = req.params.id;
    const selectCategoryId =
      "select products.idcate, products.idproducts,nameproducts,promotion, discount, description, (SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color',  (SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor,'quantity',quantity)) FROM color WHERE color.idsize = size.idsize))) FROM size WHERE size.idproducts = products.idproducts) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage',idimage,'avt',avt)) FROM image  WHERE image.idproducts = products.idproducts) image from products where products.idcate = ?";

    db.connection.query(selectCategoryId, [idcate], (error, result) => {
      if (error) throw error;
      else {
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

const removeProduct = (req, res) => {
  try {
    const { idproducts } = req.body;
    const deletepro = "update products, size, color set quantity = 0 where products.idproducts = size.idproducts and size.idsize = color.idsize and products.idproducts = ?"
    db.connection.query(deletepro, [idproducts], (error, result) => {
      if (error) throw error;
      res.status(200).json({ message: "Delete product successfully" })
    })
  } catch (error) {
    res.status(400).json({ message: "Error server" })
  }
}

module.exports = {
  addProduct,
  getProduct,
  getProductDetail,
  getCategory,
  getCategorybyID,
  updateProduct,
  removeProduct
};
