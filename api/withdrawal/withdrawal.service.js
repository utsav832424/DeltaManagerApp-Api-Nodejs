const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into withdrawal(user_id,parent_id,date,code,name,particular,withdrawal,is_active,added_datetime) values(?,?,?,?,?,?,?,?,?)',
      [
        data.user_id,
        data.parent_id,
        moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        data.code,
        data.name,
        data.particular,
        data.withdrawal,
        1,
        moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(`insert into ledger(user_id,parent_id,date,code,name,amount,particular,cr_dr_type,type,ids,is_active)
        SElECT user_id,parent_id,date,code,name,${data.withdrawal * (-1)},'The amount is added by withdrawal',2,4,${results.insertId},1 FROM withdrawal WHERE id = ${results.insertId}`);
        return callBack(null, results);
      }
    );
  },
  getAll: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;
    var where = '';
    if (data.search != "") {
      where += ` AND (code like '%${data.search}%' OR name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(date) = ${data.month}`;
    }

    if (data.code != "") {
      where += ` AND code = '${data.code}'`;
    }

    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
        count(*)as total, IFNULL(sum(w.withdrawal), 0)as total_sum 
      FROM withdrawal w
      JOIN userlogin u ON u.code = w.code
      where 
        w.is_active = 1 
        ${where} 
      ORDER BY w.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalSum = results[0].total_sum;
        pool.query(
          `select 
            w.id,DATE_FORMAT(w.date, "%d-%m-%Y")as date,w.code,w.name,w.particular,sum(w.withdrawal)as withdrawal,DATE_FORMAT(w.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
          FROM withdrawal w
          JOIN userlogin u ON u.code = w.code
          where 
            w.is_active = 1 
            ${where} 
          GROUP BY w.code 
          ORDER BY w.id desc 
          limit ${data.offset},${data.length}`,
          (error, results1, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: results[0].total,
              totalSum: results[0].total_sum,
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
      where += ` AND (code like '%${data.search}%' OR name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(date) = ${data.month}`;
    }

    if (data.code != "") {
      where += ` AND code = '${data.code}'`;
    }

    if (data.user_id != "") {
      where += ` AND parent_id=${data.user_id}`;
    }
    pool.query(
      `select count(*)as total, IFNULL(sum(withdrawal), 0)as total_sum FROM withdrawal where is_active = 1 ${where} ORDER BY id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalSum = results[0].total_sum;
        pool.query(
          `select id,DATE_FORMAT(date, "%d-%m-%Y")as date,code,name,particular,withdrawal,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime FROM withdrawal where is_active = 1 ${where} ORDER BY id desc limit ${data.offset},${data.length}`,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: totalRecord,
              totalSum: totalSum,
              data: results
            };
            return callBack(null, obj);
          }
        );
      }
    );
    
  },
  updateWithdraw: (data, callBack) => {
    pool.query(
      `update withdrawal set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', withdrawal = '${data.withdrawal}', particular = '${data.particular}' WHERE id = ${data.withdraw_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(
          `update ledger set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', amount = '${data.withdrawal * (-1)}' WHERE ids = ${data.withdraw_id} AND type = 4`,
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
  deleteWithdraw: (data, callBack) => {
    pool.query(
      `DELETE FROM withdrawal WHERE id = ${data.withdraw_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(
          `DELETE FROM ledger WHERE ids = ${data.withdraw_id} AND type = 4`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            return callBack(null, results);
          }
        );
        // return callBack(null, results);
      }
    );
  },
  getDownload: (data, callBack) => {
    var totalRecord = 0;
    var where = '';
    if (data.search != "") {
      where += ` AND (w.code like '%${data.search}%' OR w.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(w.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(w.date) = ${data.month}`;
    }

    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
      w.id,DATE_FORMAT(w.date, "%d-%m-%Y")as date,w.code,w.name,w.particular,sum(w.withdrawal)as withdrawal,DATE_FORMAT(w.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM withdrawal w
      JOIN userlogin u ON u.id = w.user_id
      where 
      w.is_active = 1 ${where} 
      GROUP BY w.code 
      ORDER BY w.id desc`,
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
      where += ` AND (w.code like '%${data.search}%' OR w.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(w.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(w.date) = ${data.month}`;
    }

    if (data.code != "" && data.code != undefined) {
      where += ` AND w.code = '${data.code}'`;
    }

    if (data.user_id != "" && data.user_id != undefined) {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    if (data.self_user_id != "" && data.self_user_id != undefined) {
      where += ` AND u.id=${data.self_user_id}`;
    }

    pool.query(
      `select 
      w.id,DATE_FORMAT(w.date, "%d-%m-%Y")as date,w.code,w.name,w.particular,w.withdrawal 
      FROM withdrawal w
      JOIN userlogin u ON u.id = w.user_id
      where 
      w.is_active = 1 ${where} 
      ORDER BY w.id desc`,
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
    var totalAmount = 0;
    var where = '';
    var subWhere = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      subWhere += ` AND YEAR(w.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(w.date) = ${data.month}`;
    }

    pool.query(
      `SELECT
      COUNT(id)as total, SUM(total_amount)as total_amount
    FROM(
      SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(sum(w.withdrawal), 0) FROM withdrawal w JOIN userlogin u ON u.id = w.user_id WHERE w.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
      FROM userlogin pu 
      WHERE 
        pu.parent_id = ${data.user_id} 
        AND pu.type = 1
    )as x`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalAmount = results[0].total_amount;
        
        pool.query(
          `SELECT pu.id,pu.username,pu.code, 
          (SELECT IFNULL(sum(w.withdrawal), 0) FROM withdrawal w JOIN userlogin u ON u.id = w.user_id WHERE w.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
          FROM userlogin pu 
          WHERE 
            pu.parent_id = ${data.user_id} 
            AND pu.type = 1 
          ORDER BY id DESC
          LIMIT ${data.offset},${data.length}`,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: totalRecord,
              totalSheet: totalAmount,
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
      subWhere += ` AND YEAR(w.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(w.date) = ${data.month}`;
    }

    pool.query(
      `SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(sum(w.withdrawal), 0) FROM withdrawal w JOIN userlogin u ON u.id = w.user_id WHERE w.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
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
  }
};