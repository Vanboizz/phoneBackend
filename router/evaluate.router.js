const express = require("express")
const router = express.Router()
const evaluateController = require("../controller/evaluate.controller.js")
const auth = require("../middleware/auth.js")
// const uploader = require("../multer/multer.js")
// const cloudinary = require("../utils/cloudinary.js")

router.post("/addEvaluate", auth, evaluateController.addEvaluate)

router.get("/getEvaluate/:idproducts", evaluateController.getEvaluate)

router.get("/getStatisticsOfReview/:idproducts", evaluateController.getStatisticsOfReview)

router.get("/getAllEvaluate", evaluateController.getAllEvaluate)


// router.post("/upload", uploader.array('file'), async (req, res) => {
//     try {
//         let pictureFiles = req.files;
//         //Check if files exist
//         if (!pictureFiles)
//             return res.status(400).json({ message: "No picture attached!" });
//         //map through images and create a promise array using cloudinary upload function
//         let multiplePicturePromise = pictureFiles.map((picture) =>
//             cloudinary.uploader.upload(picture.path)
//         );
//         // await all the cloudinary upload functions in promise.all, exactly where the magic happens
//         let imageResponses = await Promise.all(multiplePicturePromise)
//         res.status(200).json({ images: imageResponses });
//     } catch (err) {
//         res.status(500).json({
//             message: err.message,
//         });
//     }
// })

module.exports = router