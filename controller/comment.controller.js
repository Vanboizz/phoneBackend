const db = require("../connect/database.js")

const addComment = (req, res) => {
    const { idproducts, comment, parentId } = req.body
    const idusers = req.auth.id
    const isParentComment = parentId === null;
    const queryAddComment = isParentComment ?
        "INSERT INTO comments(idusers, idproducts, comment, parentId, commentday) VALUES (?, ?, ?, null, NOW())"
        :
        "INSERT INTO comments(idusers, idproducts, comment, parentId, commentday) VALUES (?, ?, ?, ?, NOW())";
    // Nếu parentId ko null thì chắc chắn có parentId tồn tại trong CSDL
    if (!isParentComment) {
        const queryCheckParent = "Select idcomment from comments where idcomment = ?"
        db.connection.query(queryCheckParent, [parentId], (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Lỗi khi kiểm tra parentId' });
            }
            if (result.length === 0) {
                return res.status(400).json({ message: 'parentId không tồn tại' });
            }
            db.connection.query(queryAddComment, [idusers, idproducts, comment, parentId], (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'Lỗi khi thêm bình luận' });
                }
                res.status(201).json({ message: 'Thêm bình luận thành công' });
            })
        })
    } else {
        // Trường parentId là null, không cần kiểm tra parentId và thêm trực tiếp.
        db.connection.query(queryAddComment, [idusers, idproducts, comment], (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Lỗi khi thêm bình luận' });
            }
            res.status(201).json({ message: 'Thêm bình luận thành công' });
        })
    }
}

const getComment = (req, res) => {
    const idproducts = req.params.idproducts;
    const querySelectComment = "select * from comments where idproducts = ? ORDER BY commentday DESC"
    db.connection.query(querySelectComment, [idproducts], (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Lỗi khi lấy bình luận' });
        }
        res.status(200).json({ data: result })
    })
}

module.exports = {
    addComment,
    getComment
};
