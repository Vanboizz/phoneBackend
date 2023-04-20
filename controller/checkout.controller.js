const db = require("../connect/database");

const checkOut = (req, res) => {
  try {
    const { phonenumber, fullname, email, address, totalprice } = req.body;
    const idusers = req.auth.id;
    const querySelect = "select * from users where idusers = ? ";
    const queryInsert =
      "insert into invoice(idusers,ivday,fullnamereceive,emailreceive,addressreceive,phonenumberreceive,statusiv,totalprice) values(?,now(),?,?,?,?,?,?)";
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
          (error) => {
            if (error) throw error;
            res.status(200).json({ message: "Insert invoice is successfull" });
          }
        );
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

module.exports = {
  checkOut,
};
