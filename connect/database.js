const mysql = require("mysql")

const connection = mysql.createConnection({
    host:"salesphonemanagement-do-user-13077884-0.b.db.ondigitalocean.com",
    user:"doadmin",
    password:"uituituit",
    database:"salesphonemanagement",
    port:25060
})

connection.connect((err)=>{
    if(err) {
        console.log(err)
    }
    console.log("success")
})

module.exports = {
    connection
}