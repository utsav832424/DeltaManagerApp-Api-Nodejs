const { createUser, superAdminUpload} = require("./profitsharing.controller");
const router = require("express").Router();
const { checkToken } =  require("../auth/token_validation");
const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    var fileData = file.originalname.split('.');
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileData[fileData.length - 1])
  }
});

var upload = multer({storage:storage});
router.post("/", upload.single('file'), checkToken, createUser);
router.post("/superAdmin", upload.single('file'), checkToken, superAdminUpload);

module.exports = router;  