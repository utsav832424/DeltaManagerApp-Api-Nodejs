const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into deposit(user_id,parent_id,date,code,name,deposite,is_active,added_datetime) values(?,?,?,?,?,?,?,?)',
      [
        data.user_id,
        data.parent_id,
        moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        data.code,
        data.name,
        data.deposite,
        1,
        moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        // pool.query(`insert into ledger(user_id,parent_id,date,code,name,amount,particular,cr_dr_type,type,ids,is_active)
        // SElECT user_id,parent_id,date,code,name,deposite,'The amount is added by deposit',1,3,${results.insertId},1 FROM deposit WHERE id = ${results.insertId}`);
        return callBack(null, results);
      }
    );
  },
  getAll: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;
    var openingBalance = 0;
    var closingBalance = 0;
    var where = '';
    var MainWhere = '';
    var whereBalance = '';
    var whereClosingBalance = '';
    var sql = '';
    if (data.search != "") {
      where += ` AND (d.code like '%${data.search}%' OR d.name like '%${data.search}%')`;
      whereBalance += `AND (dd.code like '%${data.search}%' OR dd.name like '%${data.search}%')`;
      whereClosingBalance += `AND (dd.code like '%${data.search}%' OR dd.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(d.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(d.date) = ${data.month}`;
      whereBalance += `AND DATE(dd.date) < '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(dd.date) < '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').endOf('month').format('YYYY-MM-DD')}'`;
    } else {
      whereBalance += ` AND DATE(dd.date) < '${moment().startOf('month').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(dd.date) < '${moment().endOf('month').format('YYYY-MM-DD')}'`;
    }

    if (data.code != "") {
      where += ` AND d.code = '${data.code}'`;
      whereBalance += ` AND dd.code = '${data.code}'`;
      whereClosingBalance += ` AND dd.code = '${data.code}'`;
      MainWhere += ` AND u.code = '${data.code}'`;
    }
    
    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
      whereBalance += ` AND uu.parent_id=${data.user_id}`;
      whereClosingBalance += ` AND uu.parent_id=${data.user_id}`;
      MainWhere += ` AND u.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
      (select COUNT(*)as total from userlogin u WHERE isactive = 1 ${MainWhere})as total, IFNULL(sum(d.deposite), 0)as total_sum, 
        (select IFNULL(sum(dd.deposite), 0) FROM deposit dd JOIN userlogin uu ON uu.code = dd.code where dd.is_active = 1 ${whereBalance})as opeingBalance, 
        (select IFNULL(sum(dd.deposite), 0) FROM deposit dd JOIN userlogin uu ON uu.code = dd.code where dd.is_active = 1 ${whereClosingBalance})as closingBalance
      FROM deposit d
      JOIN userlogin u ON u.code = d.code
      where 
        d.is_active = 1 
        ${where} 
      ORDER BY d.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        /* totalRecord = results[0].total;
        totalSum = results[0].total_sum;
        openingBalance = results[0].opeingBalance;
        closingBalance = results[0].closingBalance; */
        pool.query(
          `SELECT
          IFNULL(x.id, 0)as id,u.username,u.code,IFNULL(x.date, DATE_FORMAT(curdate(), "%d-%m-%Y"))as date,IFNULL(x.deposite, 0)as deposite,IFNULL(x.added_datetime, DATE_FORMAT(now(), "%e-%m-%Y %h:%i:%s %p"))as added_datetime
          FROM userlogin u 
          LEFT JOIN (select 
            d.id,d.user_id,DATE_FORMAT(d.date, "%d-%m-%Y")as date,d.code,d.name,sum(d.deposite)as deposite,DATE_FORMAT(d.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
          FROM deposit d
          JOIN userlogin u ON u.code = d.code
          where 
            d.is_active = 1 
            ${where} 
          GROUP BY d.code 
          ORDER BY d.id desc)as x ON x.user_id = u.id
          Where
            u.isactive = 1
            ${MainWhere}
          limit ${data.offset},${data.length}`,
          (error, results1, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: results[0].total,
              totalSum: results[0].total_sum,
              openingBalance: results[0].opeingBalance,
              closingBalance: results[0].closingBalance,
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
      where += ` AND (d.code like '%${data.search}%' OR d.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(d.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(d.date) = ${data.month}`;
    }

    if (data.code != "") {
      where += ` AND d.code = '${data.code}'`;
    }
    
    if (data.user_id != "") {
      where += ` AND d.parent_id=${data.user_id}`;
    }
    // console.log(`select count(*)as total, IFNULL(sum(deposite), 0)as total_sum FROM deposit d where is_active = 1 ${where} ORDER BY id desc`);
    pool.query(
      `select count(*)as total, IFNULL(sum(deposite), 0)as total_sum FROM deposit d where is_active = 1 ${where} ORDER BY id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalSum = results[0].total_sum;
        pool.query(
          `select id,DATE_FORMAT(date, "%d-%m-%Y")as date,code,name,deposite,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime FROM deposit d where is_active = 1 ${where} ORDER BY id desc limit ${data.offset},${data.length}`,
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
  updateDeposit: (data, callBack) => {
    pool.query(
      `update deposit set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', deposite = '${data.deposite}' WHERE id = ${data.deposit_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
        /* pool.query(
          `update ledger set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', amount = '${data.deposite}' WHERE ids = ${data.deposit_id} AND type = 3`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        ); */
      }
    );
  },
  deleteDeposit: (data, callBack) => {
    pool.query(
      `DELETE FROM deposit WHERE id = ${data.deposit_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
        /* pool.query(
          `DELETE FROM ledger WHERE ids = ${data.deposit_id} AND type = 3`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        ); */
      }
    );
  },
  getDownload: (data, callBack) => {
    var totalRecord = 0;
    var where = '';
    if (data.search != "") {
      where = ` AND (d.code like '%${data.search}%' OR name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(d.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(d.date) = ${data.month}`;
    }

    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
        d.id,DATE_FORMAT(d.date, "%d-%m-%Y")as date,d.code,d.name,sum(d.deposite)as deposite,DATE_FORMAT(d.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM deposit d
      JOIN userlogin u ON u.id = d.user_id
      where 
        1=1
        ${where} 
      GROUP BY d.code
      ORDER BY d.id desc`,
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
      where = ` AND (d.code like '%${data.search}%' OR d.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(d.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(d.date) = ${data.month}`;
    }

    if (data.code != "" && data.code != undefined) {
      where += ` AND d.code = '${data.code}'`;
    }

    if (data.user_id != "" && data.user_id != undefined) {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    if (data.self_user_id != "" && data.self_user_id != undefined) {
      where += ` AND u.id=${data.self_user_id}`;
    }
    pool.query(
      `select 
        d.id,DATE_FORMAT(d.date, "%d-%m-%Y")as date,d.code,d.name,d.deposite,DATE_FORMAT(d.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM deposit d
      JOIN userlogin u ON u.id = d.user_id
      where 
        1=1
        ${where} 
      ORDER BY d.id desc`,
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
    var whereBalance = '';
    var whereClosingBalance = '';
    
    if (data.search != "") {
      whereBalance += `AND (dd.code like '%${data.search}%' OR dd.name like '%${data.search}%')`;
      whereClosingBalance += `AND (dd.code like '%${data.search}%' OR dd.name like '%${data.search}%')`;
    }

    if (data.month != "" && data.month != "All") {
      whereBalance += `AND DATE(dd.date) < '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(dd.date) < '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').endOf('month').format('YYYY-MM-DD')}'`;
    } else {
      whereBalance += ` AND DATE(dd.date) < '${moment().startOf('month').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(dd.date) < '${moment().endOf('month').format('YYYY-MM-DD')}'`;
    }

    if (data.code != "" && data.code != undefined) {
      whereBalance += ` AND dd.code = '${data.code}'`;
      whereClosingBalance += ` AND dd.code = '${data.code}'`;
    }

    var where = '';
    var subWhere = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      subWhere += ` AND YEAR(d.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(d.date) = ${data.month}`;
    }

    pool.query(
      `SELECT
      COUNT(id)as total, SUM(total_amount)as total_amount, ROUND(SUM(opeingBalance), 2)as opeingBalance, ROUND(SUM(closingBalance), 2)as closingBalance
    FROM(
      SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(sum(d.deposite), 0) FROM deposit d JOIN userlogin u ON u.id = d.user_id WHERE d.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount,
      (select IFNULL(ROUND(sum(dd.deposite), 2), 0) FROM deposit dd where dd.is_active = 1 AND dd.parent_id = pu.id ${whereBalance})as opeingBalance,
    	(select IFNULL(ROUND(sum(dd.deposite), 2), 0) FROM deposit dd where dd.is_active = 1 AND dd.parent_id = pu.id ${whereClosingBalance})as closingBalance
      FROM userlogin pu 
      WHERE pu.parent_id = ${data.user_id} 
      AND pu.type = 1
    )as x`,
      (error, result, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = result[0].total;
        totalAmount = result[0].total_amount;
        
        pool.query(
          `SELECT pu.id,pu.username,pu.code, 
          (SELECT IFNULL(sum(d.deposite), 0) FROM deposit d JOIN userlogin u ON u.id = d.user_id WHERE d.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
          FROM userlogin pu 
          WHERE pu.parent_id = ${data.user_id} 
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
              openingBalance: result[0].opeingBalance,
              closingBalance: result[0].closingBalance,
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
      subWhere += ` AND YEAR(d.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(d.date) = ${data.month}`;
    }

    pool.query(
      `SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(sum(d.deposite), 0) FROM deposit d JOIN userlogin u ON u.id = d.user_id WHERE d.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
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
  getUserDetails: (data, callBack) => {
    pool.query(
      `SELECT * FROM userlogin WHERE code LIKE '${data.code}' AND type = 0 AND isactive = 1`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        
        return callBack(null, results);
      }
    );
  }
};