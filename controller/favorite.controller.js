const db = require("../connect/database")

const handleAddFavorite = (req, res) => {
    try {
        const { idproducts, idimage } = req.body
        const idusers = req.auth.id;
        const queryAddFavorite = "insert into favorite(idusers,idproducts,idimage) values(?,?,?)"
        const querySelectUser = "select * from users where idusers = ? ";
        db.connection.query(querySelectUser, [idusers], (error, result) => {
            if (error) throw error
            if (result.length) {
                db.connection.query(queryAddFavorite, [idusers, idproducts, idimage], (error, result) => {
                    if (error) throw error
                    res.status(201).json({ message: "Add favorite successfull" });
                })
            }
        })
    } catch (error) {
        res.status(400).json({ message: "Error Server" });
    }
}

const handleDeleteFavorite = (req, res) => {
    try {
        const { idproducts } = req.params
        const idusers = req.auth.id;
        const queryDeleteFavorite = "delete from favorite where idusers = ? and idproducts = ?"
        db.connection.query(queryDeleteFavorite, [idusers, idproducts], (error, result) => {
            if (error) throw error
            res.status(200).json({ message: "Delete favorite successfull" });
        })
    } catch (error) {
        res.status(400).json({ message: "Error Server" });
    }

}

const handleGetListFavorite = (req, res) => {
    try {
        const idusers = req.auth.id;
        const selectListFavourite =
            `SELECT favorite.idusers, favorite.idproducts, products.nameproducts,products.promotion,products.discount,products.description,(SELECT json_arrayagg(JSON_OBJECT('namesize',namesize,'pricesize',pricesize,'idsize',idsize,'color',(SELECT JSON_ARRAYAGG(JSON_OBJECT('idcolor',idcolor,'namecolor',namecolor,'quantity',quantity))
            FROM color
            WHERE color.idsize = size.idsize))) FROM size
                                                WHERE size.idproducts = products.idproducts) size,(SELECT JSON_ARRAYAGG(JSON_OBJECT('idimage', image.idimage,'avt',avt))
                                                FROM image WHERE image.idimage = favorite.idimage) AS image FROM favorite JOIN products ON favorite.idproducts = products.idproducts WHERE favorite.idusers = ?;`
        db.connection.query(selectListFavourite, [idusers], (error, result) => {
            if (error) throw error
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
        })
    } catch (error) {
        res.status(400).json({ message: "Error Server" });
    }
}

module.exports = {
    handleAddFavorite,
    handleDeleteFavorite,
    handleGetListFavorite
}