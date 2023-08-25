const { create,getAll, getAllByCode, updateSheet, deleteSheet, getDownload, getDownloadUserWise, getAdminBySuperAdmin, getAdminData, getAllSegment}  = require("./sheet.service");
const XLSX = require("xlsx");
const xl = require('excel4node');
const mime = require('mime');
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
                    message: "Sheet can not be added, please try agin after sometime"

                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
                message: "Sheet has been successfully added"
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
        if (data.sheet_id == "") {
            return res.json({
                success:0,
                message: 'Please enter sheet id'
            });
        } else {
            updateSheet(data,(err, results)=>{
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results,
                    message: 'Sheet record has been successfully updated.'
                });
            });
        }
    },
    deleted: (req, res) => {
        var data = req.body;
        if (data.sheet_id == "") {
            return res.json({
                success:0,
                message: 'Please enter sheet id'
            });
        } else {
            deleteSheet(data,(err, results)=>{
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results,
                    message: 'Sheet record has been successfully deleted.'
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
            var ws = wb.addWorksheet('Sheet');

            ws.cell(1, 1).string('Date');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Name');
            ws.cell(1, 4).string('Amount');
            ws.cell(1, 5).string('Admin Sharing');
            ws.cell(1, 6).string('User Sharing');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.date}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.name}`);
                ws.cell(index, 4).string(`${element.sheet}`);
                ws.cell(index, 5).string(`${element.admin_sharing}`);
                ws.cell(index, 6).string(`${element.user_sharing}`);
                index++;
            });
            var name = 'SheetExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Sheet excel file has been successfully created',
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
            var ws = wb.addWorksheet('Sheet User Wise');

            ws.cell(1, 1).string('Date');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Name');
            ws.cell(1, 4).string('Amount');
            ws.cell(1, 5).string('Admin Sharing');
            ws.cell(1, 6).string('User Sharing');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.date}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.name}`);
                ws.cell(index, 4).string(`${element.sheet}`);
                ws.cell(index, 5).string(`${element.admin_sharing}`);
                ws.cell(index, 6).string(`${element.user_sharing}`);
                index++;
            });
            var name = 'SheetUserWiseExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Sheet User Wise excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadPdf: (req, res) => {
        var data = req.query;
        getDownload(data, (err, results) => {
            var data = [[{ text: 'Date', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }, { text: 'Admin Sharing', style: 'tableHeader' }, { text: 'User Sharing', style: 'tableHeader' }]];
            results.data.forEach((element) => {
                data.push([`${element.date}`,`${element.code}`, `${element.name}`, `${element.sheet}`, `${element.admin_sharing}`, `${element.user_sharing}`]);
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
            var name = 'sheetPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Sheet pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    downloadUserWisePdf: (req, res) => {
        var data = req.query;
        getDownloadUserWise(data, (err, results) => {
            var data = [[{ text: 'Date', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }, { text: 'Admin Sharing', style: 'tableHeader' }, { text: 'User Sharing', style: 'tableHeader' }]];
            results.data.forEach((element) => {
                data.push([`${element.date}`,`${element.code}`, `${element.name}`, `${element.sheet}`, `${element.admin_sharing}`, `${element.user_sharing}`]);
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
            var name = 'sheetUserPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Sheet user pdf file has been successfully created',
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
            var ws = wb.addWorksheet('Admin Sheet');

            ws.cell(1, 1).string('Name');
            ws.cell(1, 2).string('Cdoe');
            ws.cell(1, 3).string('Admin Sharing');
            ws.cell(1, 4).string('User Sharing');
            ws.cell(1, 5).string('Amount');

            var index = 2;
            results.forEach((element) => {
                ws.cell(index, 1).string(`${element.username}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.total_admin_sharing}`);
                ws.cell(index, 4).string(`${element.total_user_sharing}`);
                ws.cell(index, 5).string(`${element.total_sheet}`);
                index++;
            });
            var name = 'AdminSheetExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Admin sheet excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadAdminPdf: (req, res) => {
        var data = req.query;
        getAdminData(data, (err, results) => {
            var data = [[{ text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Admin Sharing', style: 'tableHeader' }, { text: 'User Sharing', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }]];
            results.forEach((element) => {
                data.push([`${element.username}`, `${element.code}`, `${element.total_admin_sharing}`, `${element.total_user_sharing}`, `${element.total_sheet}`]);
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
            var name = 'AdminSheetPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Admin Sheet pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    segment: (req, res) => {
        getAllSegment((err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            var segment = [];
            results.forEach(element => {
                segment.push(element.segment);
            });
            return res.json({
                success:1,
                data:segment
            });
        })
    }
}