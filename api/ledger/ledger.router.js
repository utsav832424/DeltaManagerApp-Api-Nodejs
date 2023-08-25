const { createUser, getAll, getAllByCode, update, deleted, downloadExcel, downloadUserWiseExcel, downloadPdf, downloadUserWisePdf, getAdminUserTotal, downloadAdminExcel, downloadAdminPdf} = require("./ledger.controller");
const router = require("express").Router();
const multer = require('multer');
var upload = multer().array();
const { checkToken } =  require("../auth/token_validation");

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

module.exports = router;