const { create, getAll, getAllByCode, updateDeposit, deleteDeposit, getDownload, getDownloadUserWise, getAdminBySuperAdmin, getAdminData, getUserDetails}  = require("./deposite.service");
const XLSX = require("xlsx");
const xl = require('excel4node');
const mime = require('mime');
var moment = require('moment');
const Pdfmake = require('pdfmake');
const fs = require('fs');
var moment = require('moment');
var fonts = {
	Roboto: {
		normal: 'api/fonts/Roboto-Regular.ttf',
		bold: 'api/fonts/Roboto-Medium.ttf',
		italics: 'api/fonts/Roboto-Italic.ttf',
		bolditalics: 'api/fonts/Roboto-MediumItalic.ttf'
	}
};
let pdfmake = new Pdfmake(fonts);

module.exports = {
    createUser: (req, res) => {
        const body = req.body;
        create(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(200).json({
                    success: 0,
                    message: "deposite can not be added, please try agin after sometime"

                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
                message: "deposite has been successfully added"
            });
        });
    },
    getAll:(req, res) =>{
        var data = req.body;
        getAll(data,(err, results)=>{
            if (err) {
                console.log(err);
                return;
            }
            return res.json({
                success:1,
                data:results
            });
        });
    },
    getAllByCode:(req, res) =>{
        var data = req.body;
        getAllByCode(data,(err, results)=>{
            if (err) {
                console.log(err);
                return;
            }
            return res.json({
                success:1,
                data:results
            });
        });
    },
    update: (req, res) => {
        var data = req.body;
        if (data.deposit_id == "") {
            return res.json({
                success:0,
                message: 'Please enter deposit id'
            });
        } else {
            updateDeposit(data,(err, results)=>{
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results,
                    message: 'Deposit record has been successfully updated.'
                });
            });
        }
    },
    deleted: (req, res) => {
        var data = req.body;
        if (data.deposit_id == "") {
            return res.json({
                success:0,
                message: 'Please enter deposit id'
            });
        } else {
            deleteDeposit(data,(err, results)=>{
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results,
                    message: 'Deposit record has been successfully deleted.'
                });
            });
        }
    },
    downloadExcel: (req, res) => {
        var data = req.query;
        
        getDownload(data, (err, results) => {
            if (err) {
                return;
            }
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Deposit');

            ws.cell(1, 1).string('Date');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Name');
            ws.cell(1, 4).string('Amount');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.date}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.name}`);
                ws.cell(index, 4).string(`${element.deposite}`);
                index++;
            });
            var name = 'DepositExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Deposit excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadUserWiseExcel: (req, res) => {
        var data = req.query;
        
        getDownloadUserWise(data, (err, results) => {
            if (err) {
                return;
            }
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Deposit User Wise');

            ws.cell(1, 1).string('Date');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Name');
            ws.cell(1, 4).string('Amount');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.date}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.name}`);
                ws.cell(index, 4).string(`${element.deposite}`);
                index++;
            });
            var name = 'DepositUserWiseExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Deposit User Wise excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadPdf: (req, res) => {
        var data = req.query;
        getDownload(data, (err, results) => {
            var data = [[{ text: 'Date', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }]];
            results.data.forEach((element) => {
                data.push([`${element.date}`,`${element.code}`, `${element.name}`, `${element.deposite}`]);
            });
            
            var docDefinition = {
                content: [
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            body: data
                        }
                    },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableOpacityExample: {
                        margin: [0, 5, 0, 15],
                        fillColor: 'blue',
                        fillOpacity: 0.3
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    // alignment: 'justify'
                }
            };
            var pdfDoc = pdfmake.createPdfKitDocument(docDefinition, {});
            var name = 'depositPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Deposit pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    downloadUserWisePdf: (req, res) => {
        var data = req.query;
        getDownloadUserWise(data, (err, results) => {
            var data = [[{ text: 'Date', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }]];
            results.data.forEach((element) => {
                data.push([`${element.date}`,`${element.code}`, `${element.name}`, `${element.deposite}`]);
            });
            
            var docDefinition = {
                content: [
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            body: data
                        }
                    },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableOpacityExample: {
                        margin: [0, 5, 0, 15],
                        fillColor: 'blue',
                        fillOpacity: 0.3
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    // alignment: 'justify'
                }
            };
            var pdfDoc = pdfmake.createPdfKitDocument(docDefinition, {});
            var name = 'depositUserPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Deposit user pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    getAdminUserTotal: (req, res) => {
        var data = req.body;

        getAdminBySuperAdmin(data, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            return res.json({
                success:1,
                data:results
            });
        });
    },
    downloadAdminExcel: (req, res) => {
        var data = req.query;
        
        getAdminData(data, (err, results) => {
            if (err) {
                return;
            }
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Admin Deposit');

            ws.cell(1, 1).string('Name');
            ws.cell(1, 2).string('Cdoe');
            ws.cell(1, 3).string('Amount');

            var index = 2;
            results.forEach((element) => {
                ws.cell(index, 1).string(`${element.username}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.total_amount}`);
                index++;
            });
            var name = 'AdminDepositExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Admin deposit excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadAdminPdf: (req, res) => {
        var data = req.query;
        getAdminData(data, (err, results) => {
            var data = [[{ text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }]];
            results.forEach((element) => {
                data.push([`${element.username}`, `${element.code}`, `${element.total_amount}`]);
            });
            
            var docDefinition = {
                content: [
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            body: data
                        }
                    },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableOpacityExample: {
                        margin: [0, 5, 0, 15],
                        fillColor: 'blue',
                        fillOpacity: 0.3
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    // alignment: 'justify'
                }
            };
            var pdfDoc = pdfmake.createPdfKitDocument(docDefinition, {});
            var name = 'AdminDepositPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Admin Deposit pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    superAdminAddDeposit: (req, res) => {
        const wb = XLSX.readFile(req.file.path);
        const sheets = wb.SheetNames;

        if (sheets.length > 0) {
            const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
            data.forEach(async (element) => {
                if (element['code'] != "") {
                    await getUserDetails({ 'code': element['code'].trim() }, async (err, result) => {
                        if (err) {
                            return;
                        }

                        if (result.length > 0) {
                            var obj = {
                                user_id: result[0].id, 
                                parent_id: result[0].parent_id, 
                                date: moment(new Date()).format("DD-MM-YYYY"),
                                code:element.code,
                                name:result[0].username,
                                deposite:element.deposit,
                                is_active: 1
                            };
                            
                            await create(obj, (err, result) => {});
                            // insertdata.push([moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'), result[0].id, reqData.user_id ,element.Code,element.Name,element.Segment,element['Net P&L'],1]);
                        }
                    });
                }
            });
            return res.status(200).json({
                success: 1,
                message: "Deposit has been successfully added."
            });
        }
    }
}