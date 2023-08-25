const { create, getAll, updateNote, deleteNote } = require("./notes.service");
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

    create: (req, res) => {
        const body = req.body;
        create(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(200).json({
                    success: 0,
                    message: "note can not be added, please try agin after sometime"

                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
                message: "note has been successfully added"
            });
        });
    },
    getAll: (req, res) => {
        var data = req.body;
        getAll(data, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            return res.json({
                success: 1,
                data: results
            });
        });
    },
    update: (req, res) => {
        var data = req.body;
        if (data.note_id == "") {
            return res.json({
                success: 0,
                message: 'Please enter note id'
            });
        } else {
            updateNote(data, (err, results) => {
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success: 1,
                    data: results,
                    message: 'Note has been successfully updated.'
                });
            });
        }
    },
    deleted: (req, res) => {
        var data = req.body;
        if (data.note_id == "") {
            return res.json({
                success: 0,
                message: 'Please enter note id'
            });
        } else {
            deleteNote(data, (err, results) => {
                if (err) {
                    console.log(err);
                    return;
                }
                return res.json({
                    success: 1,
                    data: results,
                    message: 'Note has been successfully deleted.'
                });
            });
        }
    },
};