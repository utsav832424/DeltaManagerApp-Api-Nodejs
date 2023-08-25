const { create, getAll, update, deleted } = require("./notes.controller");
const router = require("express").Router();
const { checkToken } =  require("../auth/token_validation");
const multer = require('multer');
var upload = multer().array();

// router.get("/downloadAdminPdf", create);
// router.get("/",checkToken, addNote);
// router.get("/:id",checkToken, addNote);
router.post("/",upload, checkToken, create);
router.post("/getAll", upload, checkToken, getAll);
router.post("/update", upload, checkToken, update);
router.post("/delete", upload, checkToken, deleted);

module.exports = router;
