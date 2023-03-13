const mysql = require("mysql")

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"salesphone"
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