const { create, getUsers, getUserByUserId, updateUser, deleteUser, getUserByUserEmail, checkUser, createbulkuser, updatePassword, getUserByUsingCode, changeStatusUser, getDownloadUsers, getAdminBySuperAdmin, getAdminData, createAdmin, createSuperAdmin, getAllAdmin, updateAdminUser, getSuperAdmin} = require("./user.service");
const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const XLSX = require("xlsx");
const xl = require('excel4node');
const mime = require('mime');
var moment = require('moment');
const Pdfmake = require('pdfmake');
const fs = require('fs');
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
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        checkUser(body, (err, result) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: "user can not be added please try agin after sometime"

                });
            } 
            console.log("result", result);
            if (result.length == 0) {
                create(body, (err, results) => {
                    if (err) {
                        return res.status(200).json({
                            success: 0,
                            message: "user can not be added please try agin after sometime"
        
                        });
                    }
                    return res.status(200).json({
                        success: 1,
                        data: results,
                        message: "User has been successfully added"
                    });
                }); 
            } else {
                return res.status(200).json({
                    success: 0,
                    message: "User already exists, Please try again"
                });
            }
            
        });
    },
    getUsers: (req, res) => {
        var data = req.body;
        getUsers(data, (err, results) => {
            if (err) {
                return;
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    getUserByUserId: (req, res) => {
        const id = req.params.id;
        getUserByUserId(id, (err, results) => {
            if (err) {
                return;
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Record not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    update: (req, res) => {
        const body = req.body;
        if (body.user_id == '') {
            return res.json({
                success: 0,
                message: "Please enter user id"
            })
        } else {
            const salt = genSaltSync(10);
            if (body.password != "") {
                body.password = hashSync(body.password, salt);
            }
            updateUser(body, (err, results) => {
                if (err) {
                    return false;
                }
                if (!results) {
                    return res.json({
                        success: 0,
                        message: "Failed to update user"
                    })
                }
                return res.json({
                    success: 1,
                    message: "User record has been successfully updated."
                });
            });
        }
    },
    deleteUser: (req, res) => {
        const data = req.body;
        deleteUser(data, (err, results) => {
            if (err) {
                return;
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Record not Found"
                });
            }
            return res.json({
                success: 1,
                message: "User Deleted Successfully"
            });
        });
    },
    login: (req, res) => {
        const body = req.body;
        const fullCode = body.email.split(" - ");
        body.email = fullCode[0];
        if (fullCode.length == 2) {
            body.parent_code = fullCode[1];
        }
        getUserByUserEmail(body, (err, results) => {
            if (err) {
                return;
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Your email address is not valid"
                });
            }
            const result = compareSync(body.password, results.password);
            if (result) {
                results.password = undefined;
                const jsontoken = sign({ result: results }, "qwe123", {
                    expiresIn: "365d"
                });
                return res.json({
                    success: 1,
                    message: "Login successfully",
                    token: jsontoken,
                    data: results
                });
            }
            else {
                return res.json({
                    success: 0,
                    message: "Please enter correct password"
                });
            }
        });
    },
    createbulkuser: (req, res) => {
        const wb = XLSX.readFile(req.file.path);
        const sheets = wb.SheetNames;
        var insertdata = [];

        if (sheets.length > 0) {
            const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
            const salt = genSaltSync(10);
            data.forEach(async (element) => {
                if (element.Code != "") {
                    await checkUser({code: element.Code.trim()}, async (err, result) => {
                        if (result.length == 0) {
                            element.Pass = hashSync(element.Pass.toString(), salt);
                            await create({parent_id: req.body.parent_id, name: element.Name, password: element.Pass, code: element.Code.trim(), pancard:element.Pancard, admin_sharing: 100 - element.Sharing, user_sharing: element.Sharing, type: 0,isactive: 1}, (err, results) => {
                            }); 
                        }
                    });
                }
            });
            return res.status(200).json({
                success: 1,
                message: "User has been successfully added."
            });
        }
    },
    changePassword: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        if (body.password == "") {
            return res.json({
                success: 0,
                message: "Password is required, Please enter password"
            })
        } else if (body.confirm_password == "") {
            return res.json({
                success: 0,
                message: "Confirm Password is required, Please enter Confirm Password"
            })
        } else if (body.password != body.confirm_password) {
            return res.json({
                success: 0,
                message: "Confirm Password should be the same as the Password"
            })
        }
        body.password = hashSync(body.password, salt);
        updatePassword(body, (err, results) => {
            if (err) {
                return false;
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Failed to update user"
                })
            }
            return res.json({
                success: 1,
                message: "Updated Successfully"
            });
        });
    },
    getUserByCode: (req, res) => {
        const body = req.body;  
        if (body.code == "") {
            return res.json({
                success: 0,
                message: "Code is required, Please try again"
            })
        } else {
            getUserByUsingCode(body, (err, results) => {
                if (err) {
                    return false;
                }
                if (!results) {
                    return res.json({
                        success: 0,
                        message: "The user can not be found, Please try again"
                    })
                }
                return res.json({
                    success: 1,
                    data: results
                });
            });
        }
    },
    changeStatusUser: (req, res) => {
        const body = req.body;  
        if (body.status == "") {
            return res.json({
                success: 0,
                message: "Status is required, Please try again"
            })
        } else if (body.user_id == "" || body.user_id == 0) {
            return res.json({
                success: 0,
                message: "User Id is required, Please try again"
            })
        } else {
            changeStatusUser(body, (err, results) => {
                if (err) {
                    return false;
                }
                if (!results) {
                    return res.json({
                        success: 0,
                        message: "The user can not be found, Please try again"
                    })
                }
                return res.json({
                    success: 1,
                    data: results,
                    message: `User has been successfully ${body.status == 0 ? 'deactivated' : 'activated'}`
                });
            });
        }
    },
    downloadExcel: (req, res) => {
        var data = req.query;
        
        getDownloadUsers(data, (err, results) => {
            if (err) {
                return;
            }
            var wb = new xl.Workbook();
            var ws = wb.addWorksheet('Users');

            ws.cell(1, 1).string('Name');
            ws.cell(1, 2).string('Code');
            ws.cell(1, 3).string('Pan Card');
            ws.cell(1, 4).string('Admin Sharing');
            ws.cell(1, 5).string('User Sharing');
            ws.cell(1, 6).string('Is Active');

            var index = 2;
            results.data.forEach((element) => {
                ws.cell(index, 1).string(`${element.username}`);
                ws.cell(index, 2).string(`${element.code}`);
                ws.cell(index, 3).string(`${element.pancard}`);
                ws.cell(index, 4).string(`${element.admin_sharing}`);
                ws.cell(index, 5).string(`${element.user_sharing}`);
                ws.cell(index, 6).string(`${element.isactive == 1 ? 'true' : 'false'}`);
                index++;
            });
            var name = 'UserExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'User excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                    /* var file = `./public/excel/${name}`;
                    var mimeType = mime.getType(name);
                    res.setHeader("Content-Disposition", `attachment;filename=${'UserExcel'+moment().format('x')+'.xlsx'}`);
                    res.setHeader("Content-Type", mimeType);
                    res.download(file); */
                }
            });
        });
    },
    downloadPdf: (req, res) => {
        var data = req.query;
        
        getDownloadUsers(data, (err, results) => {
            var data = [[{ text: 'Name', style: 'tableHeader' }, { text: 'Code', style: 'tableHeader' }, { text: 'Pan Card', style: 'tableHeader' }, { text: 'Admin Sharing', style: 'tableHeader' }, {text: 'User Sharing', style: 'tableHeader'}, {text: 'Is Active', style: 'tableHeader'}]];
            results.data.forEach((element) => {
                data.push([`${element.username}`,`${element.code}`, `${element.pancard}`, `${element.admin_sharing}`, `${element.user_sharing}`, `${element.isactive == 1 ? 'true' : 'false'}`]);
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
            var name = 'UserPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'User pdf file has been successfully created',
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
            var ws = wb.addWorksheet('Admin User');

            ws.cell(1, 1).string('Name');
            ws.cell(1, 2).string('Cdoe');

            var index = 2;
            results.forEach((element) => {
                ws.cell(index, 1).string(`${element.username}`);
                ws.cell(index, 2).string(`${element.code}`);
                index++;
            });
            var name = 'AdminUserExcel'+moment().format('x')+'.xlsx';
            wb.write(`./public/excel/${name}`, function(err, stats) {
                if (err) {
                    console.error(err);
                } else {
                    return res.json({
                        success: 1,
                        message: 'Admin User excel file has been successfully created',
                        fileLink: `/public/excel/${name}`
                    });
                }
            });
        });
    },
    downloadAdminPdf: (req, res) => {
        var data = req.query;
        getAdminData(data, (err, results) => {
            var data = [[{ text: 'Code', style: 'tableHeader' }, { text: 'Name', style: 'tableHeader' }]];
            results.forEach((element) => {
                data.push([`${element.username}`, `${element.code}`]);
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
            var name = 'AdminUserPdf'+moment().format('x')+'.pdf';
            
            pdfDoc.pipe(fs.createWriteStream(`./public/pdf/${name}`));
            pdfDoc.end();
            return res.json({
                success: 1,
                message: 'Admin User pdf file has been successfully created',
                fileLink: `/public/pdf/${name}`
            });
        });
    },
    createAdmin: (req, res) => {
        var body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        checkUser(body, (err, result) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: "user can not be added please try agin after sometime"

                });
            } 
            
            if (result.length == 0) {
                createAdmin(body, (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(200).json({
                            status: false,
                            message: 'Please contect to admin'
                        });
                    }
        
                    return res.status(200).json({
                        status: true,
                        message: 'Admin has been successfully created'
                    });
                });
            } else {
                return res.status(200).json({
                    success: 0,
                    message: "Admin Code already exists, Please try again"
                });
            }
            
        });
        
    },
    createSuperAdmin: (req, res) => {
        var body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        checkUser(body, (err, result) => {
            if (err) {
                return res.status(200).json({
                    success: 0,
                    message: "user can not be added please try agin after sometime"

                });
            } 
            console.log("result", result);
            if (result.length == 0) {
                createSuperAdmin(body, (err, results) => {
                    if (err) {
                        return res.status(200).json({
                            status: 0,
                            message: err
                        });
                    }
        
                    return res.status(200).json({
                        status: 1,
                        message: 'Super Admin has been successfully created'
                    });
                });
            } else {
                return res.status(200).json({
                    success: 0,
                    message: "Super Admin Code already exists, Please try again"
                });
            }
            
        });
        
    },
    getAllAdmin: (req, res) => {
        var data = req.body;
        getAllAdmin(data, (err, results) => {
            if (err) {
                return;
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    updateAdmin: (req, res) => {
        const body = req.body;
        if (body.user_id == '') {
            return res.json({
                success: 0,
                message: "Please enter user id"
            })
        } else {
            const salt = genSaltSync(10);
            if (body.password != "") {
                body.password = hashSync(body.password, salt);
            }
            updateAdminUser(body, (err, results) => {
                if (err) {
                    return false;
                }
                if (!results) {
                    return res.json({
                        success: 0,
                        message: "Failed to update user"
                    })
                }
                return res.json({
                    success: 1,
                    message: "User record has been successfully updated."
                });
            });
        }
    },
    getSuperAdmin: (req, res) => {
        getSuperAdmin((err, result) => {
            if (err) {
                return res.json({
                    success: 0,
                    message: "Failed to update user"
                })
            }

            return res.json({
                success: 1,
                data: result
            })
        });
    }
};