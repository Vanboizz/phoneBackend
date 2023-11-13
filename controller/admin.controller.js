const db = require("../connect/database");
const bcrypt = require("bcrypt");

const register = (req, res) => {
  try {
    const { avatar, firstname, lastname, email, password } = req.body;
    console.log(req.body);
    const querySelect = "select email, password from users where email = ?";
    const queryInsert =
      "insert into users(avtuser, firstname, lastname, email, password, role) values(?,?,?,?,?,?)";
    if (avatar === "" || firstname === "" || lastname === "" || email === "" || password === "") {
      res.status(500).json({
        success: false,
        message: "Please fill in all field",
      });
    } 
    else {
      db.connection.query(querySelect, [email], (err, result) => {
        if (result.length > 0) {
          if (err) {
            throw err;
          } else {
            res.status(401).json({
              success: false,
              message: "This email have been already existed",
            });
          }
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              throw err;
            } else {
              db.connection.query(
                queryInsert,
                [avatar, firstname, lastname, email, hash, "admin"],
                (err) => {
                  if (err) {
                    throw err;
                  } else {
                    res.status(200).json({
                      success: true,
                      message: "The user has been registerd with us!",
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server is error",
    });
  }
};

module.exports = {
  register,
};
