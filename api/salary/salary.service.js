const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into salary(user_id,parent_id,date,code,name,salary_name,amount,is_active,added_datetime) values(?,?,?,?,?,?,?,?,?)',
      [
        data.user_id,
        data.parent_id,
        moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        data.code,
        data.name,
        data.salary_name,
        data.amount,
        1,
        moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(`insert into ledger(user_id,parent_id,date,code,name,amount,particular,cr_dr_type,type,ids,is_active)
        SElECT user_id,parent_id,date,code,name,${data.amount * (-1)},'The amount is added by salary',2,2,${results.insertId},1 FROM salary WHERE id = ${results.insertId}`);
        return callBack(null, results);
      }
    );
  },
  getAll: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;
    var where = '';
    if (data.search != "") {
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%' OR s.salary_name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.code != "") {
      where += ` AND s.code = '${data.code}'`;
    }

    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
    }
console.log(`select 
count(*)as total, IFNULL(sum(s.amount), 0)as total_sum 
FROM salary s
JOIN userlogin u ON u.code = s.code
where 
s.is_active = 1 
${where} 
ORDER BY s.id desc`);
    pool.query(
      `select 
        count(*)as total, IFNULL(sum(s.amount), 0)as total_sum 
      FROM salary s
      JOIN userlogin u ON u.code = s.code
      where 
        s.is_active = 1 
        ${where} 
      ORDER BY s.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        /* totalRecord = results[0].total;
        totalSum = results[0].total_sum; */
        pool.query(
          `select 
            s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,s.salary_name,sum(s.amount)as amount,DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
          FROM salary s
          JOIN userlogin u ON u.code = s.code
          where 
            s.is_active = 1 
            ${where} 
          GROUP BY s.code 
          ORDER BY s.id desc 
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
    // console.log(`select id,DATE_FORMAT(date, "%d-%m-%Y")as date,code,name,salary_name,amount,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime FROM salary where is_active = 1 ${where} ORDER BY id desc limit ${data.offset},${data.length}`);
    
  },
  getAllByCode: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;
    var where = '';
    if (data.search != "") {
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%' OR s.salary_name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.code != "") {
      where += ` AND s.code = '${data.code}'`;
    }

    if (data.user_id != "") {
      where += ` AND s.parent_id=${data.user_id}`;
    }
    pool.query(
      `select count(*)as total, IFNULL(sum(amount), 0)as total_sum FROM salary s where is_active = 1 ${where} ORDER BY id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalSum = results[0].total_sum;
        pool.query(
          `select id,DATE_FORMAT(date, "%d-%m-%Y")as date,code,name,salary_name,amount,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime FROM salary s where is_active = 1 ${where} ORDER BY id desc limit ${data.offset},${data.length}`,
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
  updateSalary: (data, callBack) => {
    pool.query(
      `update salary set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', salary_name = '${data.salary_name}', amount = '${data.amount}' WHERE id = ${data.salary_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(
          `update ledger set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', amount = '${data.amount}' WHERE ids = ${data.salary_id} AND type = 2`,
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
  deleteSalary: (data, callBack) => {
    pool.query(
      `DELETE FROM salary WHERE id = ${data.salary_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        pool.query(
          `DELETE FROM ledger WHERE ids = ${data.salary_id} AND type = 2`,
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
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%' OR s.salary_name like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(s.date) = ${data.month}`;
    }

    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
    }
    
    pool.query(
      `select 
        s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,s.salary_name,sum(s.amount)as amount,DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM salary s
      JOIN userlogin u ON u.id = s.user_id
      where 
        s.is_active = 1 
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
      where += ` AND (s.code like '%${data.search}%' OR s.name like '%${data.search}%' OR s.salary_name like '%${data.search}%')`;
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
        s.id,DATE_FORMAT(s.date, "%d-%m-%Y")as date,s.code,s.name,s.salary_name,s.amount,DATE_FORMAT(s.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM salary s
      JOIN userlogin u ON u.id = s.user_id
      where 
        s.is_active = 1 
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
    var totalAmount = 0;
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
      `SELECT
      COUNT(id)as total, SUM(total_amount)as total_amount
    FROM(
    SELECT pu.id,pu.username,pu.code, 
    (SELECT IFNULL(sum(s.amount), 0) FROM salary s JOIN userlogin u ON u.id = s.user_id WHERE s.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
    FROM userlogin pu 
    WHERE pu.parent_id = ${data.user_id} AND pu.type = 1${where}
    )as x`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        totalAmount = results[0].total_amount;
        
        pool.query(
          `SELECT pu.id,pu.username,pu.code, 
          (SELECT IFNULL(sum(s.amount), 0) FROM salary s JOIN userlogin u ON u.id = s.user_id WHERE s.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
          FROM userlogin pu 
          WHERE 
            pu.parent_id = ${data.user_id} 
            AND pu.type = 1
            ${where}
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
      subWhere += ` AND YEAR(s.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(s.date) = ${data.month}`;
    }

    pool.query(
      `SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(sum(s.amount), 0) FROM salary s JOIN userlogin u ON u.id = s.user_id WHERE s.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
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
  getLastMonthSalaryUser: (data, callBack) => {
    pool.query(
      `SELECT s.user_id,s.parent_id,s.code,s.name,s.salary_name,s.amount, false as value FROM salary s JOIN userlogin u ON u.id = s.user_id WHERE u.parent_id = ${data.user_id} AND MONTH(date) = MONTH(LAST_DAY(CURDATE() - INTERVAL 1 MONTH))`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        
        return callBack(null, results);
      }
    );
  },
  bulkSalaryInsert: (data, callBack) => {
    pool.query(
      'insert into salary(user_id,parent_id,date,code,name,salary_name,amount,is_active) values ?',
      [data],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        /* pool.query(
          'insert into salary(date,code,name,salary_name,amount,is_active) values ?',
          [data],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            return callBack(null, results);
          }
        ); */
      }
    );
  },
  checkSalaryIsExitsOrNot: (data, callBack) => {
    pool.query(
      `SELECT * FROM salary WHERE parent_id = ${data.user_id} AND MONTH(date) = ${moment(data.date, 'DD-MM-YYYY').format('MM')}`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
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