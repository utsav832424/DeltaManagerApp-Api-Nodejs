const { createUser,getAll, getAllByCode, update, deleted, downloadExcel, downloadUserWiseExcel, downloadPdf, downloadUserWisePdf, getAdminUserTotal, downloadAdminExcel, downloadAdminPdf, segment} = require("./sheet.controller");
const router = require("express").Router();
const multer = require('multer');
const { checkToken } =  require("../auth/token_validation");
var upload = multer().array();

router.get("/downloadExcel", downloadExcel);
router.get("/downloadUserExcel", downloadUserWiseExcel);
router.get("/downloadPdf", downloadPdf);
router.get("/downloadUserPdf", downloadUserWisePdf);
router.get("/downloadAdminExcel", downloadAdminExcel);
router.get("/downloadAdminPdf", downloadAdminPdf);
router.get("/getSegment", segment);
router.post("/",upload, checkToken, createUser);
router.post("/getAll", upload, checkToken, getAll);
router.post("/getAllByCode", upload, checkToken, getAllByCode);
router.post("/update", upload, checkToken, update);
router.post("/delete", upload, checkToken, deleted);
router.post("/getAdminTotal", upload, checkToken, getAdminUserTotal);

module.exports = router;