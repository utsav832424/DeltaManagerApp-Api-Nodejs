const { create,getAll,getAllByCode, updateWithdraw, deleteWithdraw, getDownload, getDownloadUserWise, getAdminBySuperAdmin, getAdminData}  = require("./withdrawal.service");
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
                    message: "withdrawal can not be added, please try agin after sometime"

                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
                message: "withdrawal has been successfully added"
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
        if (data.withdraw_id == "") {
            return res.json({
                success:0,
                message: 'Please enter withdraw id'
            });
        } else {
            updateWithdraw(data,(err, results)=>{
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results,
                    message: 'Withdrawal record has been successfully updated.'
                });
            });
        }
    },
    deleted: (req, res) => {
        var data = req.body;
        if (data.withdraw_id == "") {
            return res.json({
                success:0,
                message: 'Please enter withdraw id'
            });
        } else {
            deleteWithdraw(data,(err, results)=>{
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results,
                    message: 'Withdrawal record has been successfully deleted.'
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
            var ws = wb.addWorksheet('Withdrawal');

            ws.cell(1, 1).string('Date');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Name');
            ws.cell(1, 4).string('Particular');
            ws.cell(1, 5).string('Amount');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.date}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.name}`);
                ws.cell(index, 4).string(`${element.particular}`);
                ws.cell(index, 5).string(`${element.withdrawal}`);
                index++;
            });
            var name = 'WithdrawalExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Withdrawal excel file has been successfully created',
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
            var ws = wb.addWorksheet('Withdrawal User Wise');

            ws.cell(1, 1).string('Date');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Name');
            ws.cell(1, 4).string('Particular');
            ws.cell(1, 5).string('Amount');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.date}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.name}`);
                ws.cell(index, 4).string(`${element.particular}`);
                ws.cell(index, 5).string(`${element.withdrawal}`);
                index++;
            });
            var name = 'WithdrawalUserWiseExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Withdrawal User Wise excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadPdf: (req, res) => {
        var data = req.query;
        getDownload(data, (err, results) => {
            var data = [[{ text: 'Date', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Particular', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }]];
            results.data.forEach((element) => {
                data.push([`${element.date}`,`${element.code}`, `${element.name}`, `${element.particular}`, `${element.withdrawal}`]);
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
            var name = 'withdrawalPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Withdrawl pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    downloadUserWisePdf: (req, res) => {
        var data = req.query;
        getDownloadUserWise(data, (err, results) => {
            var data = [[{ text: 'Date', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }, { text: 'Particular', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }]];
            results.data.forEach((element) => {
                data.push([`${element.date}`,`${element.code}`, `${element.name}`, `${element.particular}`, `${element.withdrawal}`]);
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
            var name = 'withdrawalUserPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Withdrawl user pdf file has been successfully created',
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
            var ws = wb.addWorksheet('Admin Withdraw');

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
            var name = 'AdminWithdrawExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Admin withdraw excel file has been successfully created',
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
            var name = 'AdminWithdrawPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Admin withdraw pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
}