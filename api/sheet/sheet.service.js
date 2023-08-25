const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into  sheet(user_id,parent_id,date,code,name,segment,sheet,user_sharing,admin_sharing,isactive,added_datetime) values(?,?,?,?,?,?,?,?,?,?,?)',
      [
        data.user_id,
        data.parent_id,
        moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        data.code,
        data.name,
        data.segment,
        data.sheet,
        data.user_sharing,
        data.admin_sharing,
        1,
        moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(`insert into ledger(user_id,parent_id,date,code,name,amount,particular,cr_dr_type,type,ids,is_active)
        SElECT user_id,parent_id,date,code,name,user_sharing,'The amount is added by sheet',1,1,${results.insertId},1 FROM sheet WHERE id = ${results.insertId}`);
        return callBack(null, results);
      }
    );
  },
  getAll: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;
    var where = '';

    if (data.search != "") {
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.user_id != "") {
      where += ` AND s.parent_id=${data.user_id}`;
    }

    if (data.code != "") {
      where += ` AND s.code = '${data.code}'`;
    }
    console.log( `select 
    count(*)as total, IFNULL(ROUND(sum(s.user_sharing), 2), 0)as total_sum, IFNULL(ROUND(sum(s.admin_sharing), 2), 0)as admin_total_sum 
  FROM sheet s
  where 
    s.isactive = 1 
    ${where} 
  ORDER BY s.id desc`);
    pool.query(
      `select 
        count(*)as total, IFNULL(ROUND(sum(s.user_sharing), 2), 0)as total_sum, IFNULL(ROUND(sum(s.admin_sharing), 2), 0)as admin_total_sum,IFNULL(ROUND(SUM(s.sheet), 2), 0) as total_sheet
      FROM sheet s
      where 
        s.isactive = 1 
        ${where} 
      ORDER BY s.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalSum = results[0].total_sum;
        pool.query(
          `select 
            s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,IFNULL(ROUND(SUM(s.sheet), 2), 0) as sheet,IFNULL(ROUND(sum(s.admin_sharing), 2), 0) as admin_sharing,IFNULL(ROUND(sum(s.user_sharing), 2), 0) as user_sharing,DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
          FROM sheet s
          where 
            s.isactive = 1 
            ${where} 
          GROUP BY s.code 
          ORDER BY s.id desc limit ${data.offset},${data.length}`,
          (error, results1, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: results[0].total,
              totalSum: Math.round(results[0].admin_total_sum),
              totalUser: Math.round(results[0].total_sum),
              totalSheet: Math.round(results[0].total_sheet),
              data: results1
            };
            return callBack(null, obj);
          }
        );
      }
    );
    
  },
  getAllByCode: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;
    var where = '';

    if (data.search != "") {
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.user_id != "") {
      where += ` AND s.parent_id=${data.user_id}`;
    }

    if (data.code != "") {
      where += ` AND s.code = '${data.code}'`;
    }

    pool.query(
      `select count(*)as total,IFNULL(ROUND(sum(sheet), 2), 0)as total_sum,IFNULL(ROUND(sum(admin_sharing), 2), 0)as total_admin_sharing,IFNULL(ROUND(sum(user_sharing), 2), 0)as total_user_sharing FROM sheet s where isactive = 1 ${where} ORDER BY id desc`,
      (error, result, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = result[0].total;
        totalSum = result[0].total_sum;
        pool.query(
          `select 
            s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,s.segment,IFNULL(ROUND(s.sheet, 2), 0) as sheet,IFNULL(ROUND(s.admin_sharing, 2), 0)as admin_sharing,IFNULL(ROUND(s.user_sharing, 2), 0) as user_sharing,
            DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime,u.admin_sharing as admin_per, u.user_sharing as user_per 
          FROM sheet s
          JOIN userlogin u ON u.id = s.user_id
          where 
            s.isactive = 1 ${where}
          ORDER BY id desc 
          limit ${data.offset},${data.length}`,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: totalRecord,
              totalSum: Math.round(totalSum),
              totalUser: Math.round(result[0].total_user_sharing),
              totalAdmin: Math.round(result[0].total_admin_sharing),
              data: results
            };
            return callBack(null, obj);
          }
        );
      }
    );
  },
  updateSheet: (data, callBack) => {
    pool.query(
      `update sheet set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', sheet = '${data.sheet}', admin_sharing = '${data.admin_sharing}', user_sharing = '${data.user_sharing}' WHERE id = ${data.sheet_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(
          `update ledger set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', amount = '${data.sheet}' WHERE ids = ${data.sheet_id} AND type = 1`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            return callBack(null, results);
          }
        );
      }
    );
  },
  deleteSheet: (data, callBack) => {
    pool.query(
      `DELETE FROM sheet WHERE id = ${data.sheet_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(
          `DELETE FROM ledger WHERE ids = ${data.sheet_id} AND type = 1`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            return callBack(null, results);
          }
        );
      }
    );
  },
  getDownload: (data, callBack) => {
    var totalRecord = 0;
    var where = '';

    if (data.search != "") {
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.user_id != "") {
      where += ` AND s.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
        s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,IFNULL(ROUND(SUM(s.sheet), 2), 0) as sheet,IFNULL(ROUND(sum(s.admin_sharing), 2), 0) as admin_sharing,IFNULL(ROUND(sum(s.user_sharing), 2), 0) as user_sharing,DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM sheet s
      where 
        s.isactive = 1 
        ${where} 
      GROUP BY s.code 
      ORDER BY s.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        var obj = {
          totalRecord: totalRecord,
          data: results
        };
        return callBack(null, obj);
      }
    );
  },
  getDownloadUserWise: (data, callBack) => {
    var totalRecord = 0;
    var where = '';

    if (data.search != "") {
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.code != "" && data.code != undefined) {
      where += ` AND s.code = '${data.code}'`;
    }

    if (data.user_id != "" && data.user_id != undefined) {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    if (data.self_user_id != "" && data.self_user_id != undefined) {
      where += ` AND u.id=${data.self_user_id}`;
    }

    pool.query(
      `select 
        s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,IFNULL(ROUND(s.sheet, 2), 0) as sheet,IFNULL(ROUND(s.admin_sharing, 2), 0) as admin_sharing,IFNULL(ROUND(s.user_sharing, 2), 0) as user_sharing,DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM sheet s
      JOIN userlogin u ON u.id = s.user_id
      where 
        s.isactive = 1 
        ${where} 
      ORDER BY s.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        var obj = {
          totalRecord: totalRecord,
          data: results
        };
        return callBack(null, obj);
      }
    );
  },
  getAdminBySuperAdmin: (data, callBack) => {
    var totalRecord = 0;
    var totalSheet = 0;
    var totalAdmin = 0;
    var totalUser = 0;
    var where = '';
    var subWhere = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.name like '%${data.search}%')`;
      subWhere += ` AND (u.code like '%${data.search}%' OR u.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      subWhere += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(s.date) = ${data.month}`;
    }

    pool.query(
      `SELECT
        COUNT(id)as total, IFNULL(ROUND(SUM(total_sheet), 2), 0)as total_sheet, IFNULL(ROUND(SUM(total_admin_sharing), 2), 0)as total_admin_sharing, IFNULL(ROUND(SUM(total_user_sharing), 2), 0)as total_user_sharing
      FROM(
      SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_sheet,
      ((SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere}) * pu.admin_sharing ) / 100 as total_admin_sharing,
      ((SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere}) * pu.user_sharing ) /100 as total_user_sharing
      FROM userlogin pu 
      WHERE pu.parent_id = ${data.user_id} AND pu.type = 1${where}
      )as x`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalSheet = results[0].total_sheet;
        totalAdmin = results[0].total_admin_sharing;
        totalUser = results[0].total_user_sharing;

        pool.query(
          `SELECT pu.id,pu.username,pu.code, 
          (SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_sheet,
          ((SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere}) * pu.admin_sharing ) / 100 as total_admin_sharing,
          ((SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere}) * pu.user_sharing ) /100 as total_user_sharing
          FROM userlogin pu 
          WHERE 
            pu.parent_id = ${data.user_id}
            AND pu.type = 1 
            ${where}
            ORDER BY id DESC
            limit ${data.offset},${data.length}`,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: totalRecord,
              totalSheet: Math.round(totalSheet),
              totalAdmin: Math.round(totalAdmin),
              totalUser: Math.round(totalUser),
              data: results
            };
            return callBack(null, obj);
          }
        );
      }
    );
  },
  getAdminData: (data, callBack) => {
    var where = '';
    var subWhere = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      subWhere += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(s.date) = ${data.month}`;
    }

    pool.query(
      `SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(ROUND(sum(s.sheet), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_sheet,
      (SELECT IFNULL(ROUND(sum(s.admin_sharing), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_admin_sharing,
      (SELECT IFNULL(ROUND(sum(s.user_sharing), 2), 0) FROM sheet s JOIN userlogin u ON u.id = s.user_id WHERE s.isactive = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_user_sharing
      FROM userlogin pu 
      WHERE 
        pu.parent_id = ${data.user_id}
        AND pu.type = 1 
        ${where}
        ORDER BY id DESC`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        
        return callBack(null, results);
      }
    );
  },
  getAllSegment: (callBack) => {
    pool.query(
      `SELECT DISTINCT(name)as segment FROM segment`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
};