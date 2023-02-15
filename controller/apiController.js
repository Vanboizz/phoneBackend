const db = require("../connect/database");

const register = (req, res) => {
  try {
    const query = "select * from users";
    db.connection.query(query, (err, result) => {
      res.json({ data: result });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  register,
};
