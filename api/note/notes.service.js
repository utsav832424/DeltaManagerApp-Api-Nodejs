const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
    create: (data, callBack) => {
        pool.query(
            'insert into notes(user_id,parent_id,date,title,description,is_active,added_datetime) values(?,?,?,?,?,?,?)',
            [
                data.user_id,
                data.parent_id,
                moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
                data.title,
                data.description,
                1,
                moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getAll: (data, callBack) => {
        var where = '';

        if (data.year != "") {
            where += ` AND YEAR(n.date) = ${data.year}`;
        }

        if (data.month != "" && data.month != "All") {
            where += ` AND MONTH(n.date) = ${data.month}`;
        }

        if (data.user_id != "") {
            where += ` AND n.parent_id=${data.user_id}`;
            where += ` AND n.user_id=${data.user_id}`;
        }

        pool.query(
            `select 
            count(*)as total
          FROM notes n
          where 
            n.is_active = 1 
            ${where} 
          ORDER BY n.id desc`,
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                pool.query(
                    `select 
                *,DATE_FORMAT(n.date, "%d-%m-%Y")as date,DATE_FORMAT(n.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
              FROM notes n
              where 
                n.is_active = 1 
                ${where} 
              ORDER BY n.id desc 
              limit ${data.offset},${data.length}`,
                    (error, results1, fields) => {
                        if (error) {
                            callBack(error);
                        }
                        var obj = {
                            totalRecord: results[0].total,
                            data: results1
                        };
                        return callBack(null, obj);
                    }
                );
            }
        );
    },
    updateNote: (data, callBack) => {
        pool.query(
            `update notes set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', title = '${data.title}', description = '${data.description}' WHERE id = ${data.note_id}`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    deleteNote: (data, callBack) => {
        pool.query(
            `DELETE FROM notes WHERE id = ${data.note_id}`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
};