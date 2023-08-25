const { create, getUserByUsingCode, deleteOldSheetEntry, checkSheetIsUpload, checkSuperAdminSheetIsUpload} = require("./profitsharing.service");
const XLSX = require("xlsx");
var moment = require('moment');

module.exports = {
    createUser: (req, res) => {
        const wb = XLSX.readFile(req.file.path);
        const sheets = wb.SheetNames;
        var insertdata = [];
        var reqData = req.body;

        if (sheets.length > 0) {
            checkSheetIsUpload({ user_id: reqData.user_id, month: moment(reqData.date, 'DD-MM-YYYY').format('MM') }, (err, result) => {
                if (err) {
                    return;
                }
                console.log("result", result);
                if (result.length > 0) {
                    var ids = result.map(element => {
                        return element.id;
                    });

                    deleteOldSheetEntry({ ids: ids }, (err, callBack) => {
                        const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
                        data.forEach(async (element) => {
                            if (element['Client Name'] != "") {
                                await getUserByUsingCode({ 'code': element['Client Code'].trim(), user_id: reqData.user_id }, (err, result) => {
                                    if (err) {
                                        return;
                                    }

                                    if (result.length > 0) {
                                        var obj = {
                                            user_id: result[0].id,
                                            parent_id: reqData.user_id,
                                            code: element['Client Code'].trim(),
                                            date: moment(reqData.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                            name: result[0].username,
                                            segment: element.Segment,
                                            sheet: element['Net P&L'],
                                            admin_sharing: (element['Net P&L'] * result[0].admin_sharing) / 100,
                                            user_sharing: (element['Net P&L'] * result[0].user_sharing) / 100
                                        }
                                        create(obj, (err, results) => {
                                            if (err) {
                                                return res.status(200).json({
                                                    success: 0,
                                                    message: "Database connection errror"
                                                });
                                            }
                                        });
                                        // insertdata.push([moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), result[0].id, reqData.user_id ,element.Code,element.Name,element.Segment,element['Net P&L'],1]);
                                    }
                                });
                            }
                        });
                    });
                } else {
                    const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    data.forEach(async (element) => {
                        if (element['Client Name'] != "") {
                            await getUserByUsingCode({ 'code': element['Client Code'].trim(), user_id: reqData.user_id }, (err, result) => {
                                if (err) {
                                    return;
                                }

                                if (result.length > 0) {
                                    var obj = {
                                        user_id: result[0].id,
                                        parent_id: reqData.user_id,
                                        code: element['Client Code'].trim(),
                                        date: moment(reqData.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                        name: result[0].username,
                                        segment: element.Segment,
                                        sheet: element['Net P&L'],
                                        admin_sharing: (element['Net P&L'] * result[0].admin_sharing) / 100,
                                        user_sharing: (element['Net P&L'] * result[0].user_sharing) / 100
                                    }
                                    create(obj, (err, results) => {
                                        if (err) {
                                            return res.status(200).json({
                                                success: 0,
                                                message: "Database connection errror"
                                            });
                                        }
                                    });
                                    // insertdata.push([moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), result[0].id, reqData.user_id ,element.Code,element.Name,element.Segment,element['Net P&L'],1]);
                                }
                            });
                        }
                    });
                }
            });
            return res.status(200).json({
                success: 1,
                message: "Sheet has been successfully added."
            });
        }
    },
    superAdminUpload: (req, res) => {
        const wb = XLSX.readFile(req.file.path);
        const sheets = wb.SheetNames;
        var insertdata = [];
        var reqData = req.body;

        if (sheets.length > 0) {
            const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
            data.forEach(async (element) => {
                if (element['Code'] != "") {
                    checkSuperAdminSheetIsUpload({ 'code': element['Code'].trim(), month: moment(reqData.date, 'DD-MM-YYYY').format('MM') }, async (err, result) => {
                        if (err) {
                            return;
                        }
                        if (result.length > 0) {
                            var ids = result.map(element => {
                                return element.id;
                            });
                            deleteOldSheetEntry({ ids: ids }, async (deleteErr, deleteResult) => {
                                if (deleteErr) {
                                    return;
                                }

                                await getUserByUsingCode({ 'code': element['Code'].trim() }, (err, userResult) => {
                                    if (err) {
                                        return;
                                    }

                                    if (userResult.length > 0) {
                                        var obj = {
                                            user_id: userResult[0].id,
                                            parent_id: userResult[0].parent_id,
                                            code: element['Code'].trim(),
                                            date: moment(reqData.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                            name: userResult[0].username,
                                            segment: element.Segment,
                                            sheet: element['Net P&L'],
                                            admin_sharing: (element['Net P&L'] * userResult[0].admin_sharing) / 100,
                                            user_sharing: (element['Net P&L'] * userResult[0].user_sharing) / 100
                                        }
                                        create(obj, (err, results) => {
                                            if (err) {
                                                return res.status(200).json({
                                                    success: 0,
                                                    message: "Database connection errror"
                                                });
                                            }
                                        });
                                        // insertdata.push([moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), result[0].id, reqData.user_id ,element.Code,element.Name,element.Segment,element['Net P&L'],1]);
                                    }
                                });
                            });
                        } else {
                            await getUserByUsingCode({ 'code': element['Code'].trim() }, (err, userResult) => {
                                if (err) {
                                    return;
                                }

                                if (userResult.length > 0) {
                                    var obj = {
                                        user_id: userResult[0].id,
                                        parent_id: userResult[0].parent_id,
                                        code: element['Code'].trim(),
                                        date: moment(reqData.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                                        name: userResult[0].username,
                                        segment: element.Segment,
                                        sheet: element['Net P&L'],
                                        admin_sharing: (element['Net P&L'] * userResult[0].admin_sharing) / 100,
                                        user_sharing: (element['Net P&L'] * userResult[0].user_sharing) / 100
                                    }
                                    create(obj, (err, results) => {
                                        if (err) {
                                            return res.status(200).json({
                                                success: 0,
                                                message: "Database connection errror"
                                            });
                                        }
                                    });
                                    // insertdata.push([moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), result[0].id, reqData.user_id ,element.Code,element.Name,element.Segment,element['Net P&L'],1]);
                                }
                            });
                        }
                    });
                }
            });
            
            return res.status(200).json({
                success: 1,
                message: "Sheet has been successfully added."
            });
        }
    },
};