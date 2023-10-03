const db = require("../connect/database.js")
const cloudinary = require("../utils/cloudinary.js")

const addEvaluate = async (req, res) => {
    try {
        // Extract data from the request body
        const { idproducts, starnumber, review, images, performance, batterylife, cameraquantity } = req.body;
        const idusers = req.auth.id; // Assuming this is a valid way to get the user's ID

        // Your SQL queries
        const queryGetEvaluate = "SELECT * FROM detailinvoice WHERE idproducts = ? AND idiv IN (SELECT idiv FROM invoice WHERE idusers = ?)";
        const queryAddEvaluate = "INSERT INTO evaluate(idusers, idproducts, evaluateday, starnumber, review, images, performance, batterylife, cameraquantity) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)";

        // Check if the user has purchased the product
        const result = await new Promise((resolve, reject) => {
            db.connection.query(queryGetEvaluate, [idproducts, idusers], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length > 0) {
            // User has purchased the product, allow rating and image upload
            const imageUploadPromises = images.map(async (image) => {
                try {
                    const uploadResponse = await cloudinary.uploader.upload(image, {
                        upload_preset: 'products',
                    });
                    return uploadResponse.secure_url;
                } catch (uploadError) {
                    throw uploadError;
                }
            });

            const uploadedImageUrls = await Promise.all(imageUploadPromises);

            // Insert the evaluation data into the database
            db.connection.query(queryAddEvaluate, [
                idusers,
                idproducts,
                JSON.stringify(starnumber),
                review,
                JSON.stringify(uploadedImageUrls), // Store uploaded image URLs as JSON
                JSON.stringify(performance),
                JSON.stringify(batterylife),
                JSON.stringify(cameraquantity)
            ], (error, insertResult) => {
                if (error) {
                    console.error("Server-side error:", error);
                    res.status(500).json({ error: 'Lỗi khi thực hiện truy vấn.' });
                } else {
                    res.status(201).json({ message: "Add evaluate is successful" });
                }
            });
        } else {
            // User has not purchased the product, disallow rating
            res.status(403).json({ error: 'Người dùng chưa mua sản phẩm.' });
        }
    } catch (error) {
        console.error("Server-side error:", error);
        res.status(500).json({ error: 'Error Server.' });
    }
};

const getEvaluate = (req, res) => {
    try {
        const idproducts = req.params.idproducts;
        const starRating = parseInt(req.query.starRating);
        let queryGetEvaluate;

        if (starRating) {
            queryGetEvaluate =
                "SELECT * FROM evaluate WHERE idproducts = ? AND JSON_EXTRACT(starnumber, '$.number') = ? ORDER BY evaluateday DESC";
        } else {
            queryGetEvaluate = "SELECT * FROM evaluate WHERE idproducts = ? ORDER BY evaluateday DESC";
        }

        db.connection.query(queryGetEvaluate, [idproducts, starRating], (error, result) => {
            if (error) throw error;
            const arr = result.map(value => {
                return {
                    ...value,
                    images: JSON.parse(value.images),
                    starnumber: JSON.parse(value.starnumber),
                    performance: JSON.parse(value.performance),
                    batterylife: JSON.parse(value.batterylife),
                    cameraquantity: JSON.parse(value.cameraquantity)
                };
            });
            res.status(200).json({ data: arr });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error Server.' });
    }
}

const getStatisticsOfReview = (req, res) => {
    try {
        const idproducts = req.params.idproducts;
        const queryGetEvaluate = "SELECT idevaluate,starnumber,performance,batterylife,cameraquantity FROM evaluate WHERE idproducts = ?";
        db.connection.query(queryGetEvaluate, [idproducts], (error, result) => {
            if (error) throw error;
            const arr = result.map(value => {
                return {
                    ...value,
                    starnumber: JSON.parse(value.starnumber),
                    performance: JSON.parse(value.performance),
                    batterylife: JSON.parse(value.batterylife),
                    cameraquantity: JSON.parse(value.cameraquantity)
                };
            });
            res.status(200).json({ data: arr });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error Server.' });
    }
}

module.exports = {
    addEvaluate,
    getEvaluate,
    getStatisticsOfReview
}