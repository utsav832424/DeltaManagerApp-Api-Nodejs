const { createUser, getUserByUserId, getUsers, update, deleteUser,login,createbulkuser, changePassword, getUserByCode, changeStatusUser, downloadExcel, downloadPdf, getAdminUserTotal, downloadAdminExcel, downloadAdminPdf, createAdmin, createSuperAdmin, getAllAdmin, updateAdmin, getSuperAdmin} = require("./user.controller");
const router = require("express").Router();
const { checkToken } =  require("../auth/token_validation");
const multer = require('multer');
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

var fileupload = multer({storage:storage});

router.get("/getSuperAdmin", getSuperAdmin);
router.get("/downloadPdf", downloadPdf);
router.get("/downloadExcel", downloadExcel);
router.get("/downloadAdminExcel", downloadAdminExcel);
router.get("/downloadAdminPdf", downloadAdminPdf);
router.get("/",checkToken, getUsers);
router.get("/:id",checkToken, getUserByUserId);
router.post("/",upload, checkToken, createUser);
// router.patch("/", checkToken,updateUser);
// router.delete("/",checkToken, deleteUser);
router.post("/login",upload,login);
router.post("/sheet", fileupload.single('file'),checkToken, createbulkuser);
router.post("/getAllUser", upload, checkToken, getUsers);
router.post("/changePassword", upload, checkToken, changePassword);
router.post("/update", upload, checkToken, update);
router.post("/delete", upload, checkToken, deleteUser);
router.post("/getUserCode", upload, getUserByCode);
router.post("/changeStatus", upload, changeStatusUser);
router.post("/getAdminTotal", upload, checkToken, getAdminUserTotal);
router.post("/createAdmin", upload, checkToken, createAdmin);
router.post("/createSuperAdmin", upload, checkToken, createSuperAdmin);
router.post("/getAllAdmin", upload, checkToken, getAllAdmin);
router.post("/updateAdmin", upload, checkToken, updateAdmin);

module.exports = router;
