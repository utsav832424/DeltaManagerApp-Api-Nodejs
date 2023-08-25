const { createUser, getAll, getAllByCode, update, deleted, downloadExcel, downloadUserWiseExcel, downloadPdf, downloadUserWisePdf, getAdminUserTotal, downloadAdminExcel, downloadAdminPdf, superAdminAddDeposit} = require("./deposite.controller");
const router = require("express").Router();
const multer = require('multer');
const { checkToken } =  require("../auth/token_validation");
var upload = multer().array();

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
var fileUpload = multer({storage:storage});

router.get("/downloadExcel", downloadExcel);
router.get("/downloadUserExcel", downloadUserWiseExcel);
router.get("/downloadPdf", downloadPdf);
router.get("/downloadUserPdf", downloadUserWisePdf);
router.get("/downloadAdminExcel", downloadAdminExcel);
router.get("/downloadAdminPdf", downloadAdminPdf);
router.post("/",upload, checkToken, createUser);
router.post("/getAll", upload, checkToken, getAll);
router.post("/getAllByCode", upload, checkToken, getAllByCode);
router.post("/update", upload, checkToken, update);
router.post("/delete", upload, checkToken, deleted);
router.post("/getAdminTotal", upload, checkToken, getAdminUserTotal);
router.post("/addDepositBySuperAdmin", fileUpload.single('file'), checkToken, superAdminAddDeposit);

module.exports = router;