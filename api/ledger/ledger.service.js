const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into ledger(user_id,parent_id,date,code,name,amount,particular,cr_dr_type,is_active,added_datetime) values(?,?,?,?,?,?,?,?,?,?)',
      [
        data.user_id,
        data.parent_id,
        moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        data.code,
        data.name,
        data.amount,
        data.particular,
        data.cr_dr_type,
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
    var totalRecord = 0;
    var totalSum = 0;
    var openingBalance = 0;
    var closingBalance = 0;
    var totalSum = 0;
    var where = '';
    var whereBalance = '';
    var whereClosingBalance = '';
    if (data.search != "") {
      where += ` AND (l.code like '%${data.search}%' OR l.name like '%${data.search}%')`;
      whereBalance += ` AND (ll.code like '%${data.search}%' OR ll.name like '%${data.search}%')`;
      whereClosingBalance += ` AND (ll.code like '%${data.search}%' OR ll.name like '%${data.search}%')`;
    }
    
    if (data.year != "") {
      where += ` AND YEAR(l.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(l.date) = ${data.month}`;
      whereBalance += ` AND DATE(ll.date) <= '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(ll.date) <= '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').endOf('month').format('YYYY-MM-DD')}'`;
    } else {
      whereBalance += ` AND DATE(ll.date) <= '${moment().startOf('month').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(ll.date) <= '${moment().endOf('month').format('YYYY-MM-DD')}'`;
    }

    if (data.code != "") {
      where += ` AND l.code = '${data.code}'`;
      whereBalance += ` AND ll.code = '${data.code}'`;
      whereClosingBalance += ` AND ll.code = '${data.code}'`;
    }

    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
      whereBalance += ` AND uu.parent_id=${data.user_id}`;
      whereClosingBalance += ` AND uu.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
        count(*)as total, IFNULL(ROUND(sum(l.amount), 2), 0)as total_sum, 
        (select IFNULL(ROUND(sum(ll.amount), 2), 0) FROM ledger ll JOIN userlogin uu ON uu.id = ll.user_id where ll.is_active = 1 ${whereBalance})as opeingBalance, 
        (select IFNULL(ROUND(sum(ll.amount), 2), 0) FROM ledger ll JOIN userlogin uu ON uu.id = ll.user_id where ll.is_active = 1 ${whereClosingBalance})as closingBalance 
      FROM ledger l
      JOIN userlogin u ON u.id = l.user_id
      where 
        l.is_active = 1 
        ${where} 
      ORDER BY l.id desc`,
      (error, results1, fields) => {
        if (error) {
          callBack(error);
        } else {
          /* totalRecord = results1[0].total;
          totalSum = results1[0].total_sum;
          openingBalance = results1[0].opeingBalance;
          closingBalance = results1[0].closingBalance; */
          pool.query(
            `select 
              l.id,DATE_FORMAT(l.date, "%d-%m-%Y")as date,l.code,l.name, IFNULL((SELECT ROUND(SUM(amount),2) FROM ledger ll WHERE ll.user_id = l.user_id),0)as amount,l.particular,l.cr_dr_type,l.type,DATE_FORMAT(l.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
            FROM ledger l 
            JOIN userlogin u ON u.id = l.user_id
            where 
              l.is_active = 1 
              ${where} 
            GROUP BY l.code 
            ORDER BY l.id desc 
            limit ${data.offset},${data.length}`,
            (error, results, fields) => {
              if (error) {
                callBack(error);
              } else {
                
                var obj = {
                  totalRecord: results1[0].total,
                  totalSum: Math.round(results1[0].total_sum),
                  openingBalance: Math.round(results1[0].opeingBalance),
                  closingBalance: Math.round(results1[0].closingBalance),
                  data:results 
                };
                return callBack(null, obj);
              }
            }
          );
        }
      }
    );
  },
  getAllByCode: (data, callBack) => {
    var totalRecord = 0;
    var totalSum = 0;

    var where = '';
    var whereBalance = '';
    var whereClosingBalance = '';
    if (data.search != "") {
      where += ` AND (l.code like '%${data.search}%' OR l.name like '%${data.search}%')`;
      whereBalance += ` AND (ll.code like '%${data.search}%' OR ll.name like '%${data.search}%')`;
      whereClosingBalance += ` AND (ll.code like '%${data.search}%' OR ll.name like '%${data.search}%')`;
    }
    
    if (data.year != "") {
      where += ` AND YEAR(l.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(l.date) = ${data.month}`;
      whereBalance += ` AND DATE(ll.date) <= '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(ll.date) <= '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').endOf('month').format('YYYY-MM-DD')}'`;
    } else {
      whereBalance += ` AND DATE(ll.date) <= '${moment().startOf('month').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(ll.date) <= '${moment().endOf('month').format('YYYY-MM-DD')}'`;
    }

    if (data.code != "") {
      where += ` AND l.code = '${data.code}'`;
      whereBalance += ` AND ll.code = '${data.code}'`;
      whereClosingBalance += ` AND ll.code = '${data.code}'`;
    }

    /* if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
      whereBalance += ` AND uu.parent_id=${data.user_id}`;
      whereClosingBalance += ` AND uu.parent_id=${data.user_id}`;
    } */

    /* if (data.search != "") {
      where += `AND (code like '%${data.search}%' OR name like '%${data.search}%')`;
    }
    
    if (data.year != "") {
      where += `AND YEAR(date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(date) = ${data.month}`;
    } */

    pool.query(
      `select 
      count(*)as total, IFNULL(ROUND(sum(amount), 2), 0)as total_sum,
      (select IFNULL(ROUND(sum(ll.amount), 2), 0) FROM ledger ll JOIN userlogin uu ON uu.id = ll.user_id where ll.is_active = 1 ${whereBalance})as opeingBalance, 
      (select IFNULL(ROUND(sum(ll.amount), 2), 0) FROM ledger ll JOIN userlogin uu ON uu.id = ll.user_id where ll.is_active = 1 ${whereClosingBalance})as closingBalance 
      FROM ledger l where is_active = 1 ${where} ORDER BY l.id desc`,
      (error, result, fields) => {
        if (error) {
          callBack(error);
        }
        
        totalRecord = result[0].total;
        totalSum = result[0].total_sum;
        pool.query(
          `select 
            id,DATE_FORMAT(date, "%d-%m-%Y")as date,code,name,ROUND(amount, 2)as amount,particular,cr_dr_type,type,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime,
            CASE
              WHEN type = 2 THEN 
                (SELECT salary_name FROM salary where id = ids)
              ELSE
                ""
            END as salary_name
            FROM ledger l where is_active = 1 AND code = '${data.code}' ${where} ORDER BY l.id desc limit ${data.offset},${data.length}`,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            var obj = {
              totalRecord: totalRecord,
              totalSum: Math.round(totalSum),
              openingBalance: Math.round(result[0].opeingBalance),
              closingBalance: Math.round(result[0].closingBalance),
              data:results 
            };
            return callBack(null, obj);
          }
        );
      }
    );
  },
  updateLedger: (data, callBack) => {

    pool.query(`select * from ledger WHERE id = ${data.ledger_id}`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        if (results[0].type == 1) {
          pool.query(
            `select * from userlogin WHERE id = ${results[0].user_id}`,
            (error, result, fields) => {
              if (error) {
                return callBack(error);
              }
              pool.query(
                `update sheet set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', sheet = '${(data.cr_dr_type == 1) ? data.amount : data.amount * -1}', admin_sharing = '${(data.cr_dr_type == 1) ? ((data.amount * result[0].admin_sharing) / 100) : ((data.amount * result[0].admin_sharing) / 100) * -1}', user_sharing = '${(data.cr_dr_type == 1) ? ((data.amount * result[0].user_sharing) / 100) : ((data.amount * result[0].user_sharing) / 100) * -1}' WHERE id = ${results[0].ids}`,
                [],
                (error, results, fields) => {
                  if (error) {
                    // return callBack(error);
                  }
                }
              );
            }
          );
          
        } else if (results[0].type == 2) {
          pool.query(
            `update salary set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}',amount = '${(data.cr_dr_type == 1) ? data.amount : data.amount * -1}' WHERE id = ${results[0].ids}`,
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        } else if (results[0].type == 3) {
          pool.query(
            `update deposit set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}',deposite = '${(data.cr_dr_type == 1) ? data.amount : data.amount * -1}' WHERE id = ${results[0].ids}`,
            [],
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        } else if (results[0].type == 4) {
          pool.query(
            `update withdrawal set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}',withdrawal = '${(data.cr_dr_type == 1) ? data.amount : data.amount * -1}' WHERE id = ${results[0].ids}`,
            [],
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        }
        
        pool.query(
          `update ledger set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', amount = '${(data.cr_dr_type == 1) ? data.amount : data.amount * -1}', particular = '${data.particular}', cr_dr_type = ${data.cr_dr_type} WHERE id = ${data.ledger_id}`,
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

    /* pool.query(
      `update ledger set date = '${moment(data.date, 'DD-MM-YYYY').format('YYYY-MM-DD')}', name = '${data.name}', amount = '${(data.cr_dr_type == 1) ? data.amount : data.amount * -1}', particular = '${data.particular}', cr_dr_type = ${data.cr_dr_type} WHERE id = ${data.ledger_id}`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    ); */
  },
  deleteLedger: (data, callBack) => {
    
    pool.query(`select * from ledger WHERE id = ${data.ledger_id}`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        if (results[0].type == 1) {
          pool.query(
            `DELETE FROM sheet WHERE id = ${results[0].ids}`,
            [],
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        } else if (results[0].type == 2) {
          pool.query(
            `DELETE FROM salary WHERE id = ${results[0].ids}`,
            [],
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        } else if (results[0].type == 3) {
          pool.query(
            `DELETE FROM deposit WHERE id = ${results[0].ids}`,
            [],
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        } else if (results[0].type == 4) {
          pool.query(
            `DELETE FROM withdrawal WHERE id = ${results[0].ids}`,
            [],
            (error, results, fields) => {
              if (error) {
                // return callBack(error);
              }
            }
          );
        }
        
        pool.query(
          `DELETE FROM ledger WHERE id = ${data.ledger_id}`,
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
      where += ` AND (l.code like '%${data.search}%' OR l.name like '%${data.search}%')`;
    }
    
    if (data.year != "") {
      where += ` AND YEAR(l.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(l.date) = ${data.month}`;
    }
    
    if (data.user_id != "") {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    pool.query(
      `select 
        l.id,DATE_FORMAT(l.date, "%d-%m-%Y")as date,l.code,l.name,ROUND(sum(l.amount), 2)as amount,l.particular,l.cr_dr_type,l.type,DATE_FORMAT(l.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM ledger l
      JOIN userlogin u ON u.id = l.user_id
      where 
        is_active = 1 
        ${where} 
      GROUP BY l.code 
      ORDER BY l.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        } else {
          
          var obj = {
            totalRecord: totalRecord,
            data:results 
          };
          return callBack(null, obj);
        }
      }
    );
  },
  getDownloadUserWise: (data, callBack) => {
    var totalRecord = 0;
    var where = '';
    if (data.search != "") {
      where += ` AND (l.code like '%${data.search}%' OR l.name like '%${data.search}%')`;
    }
    
    if (data.year != "") {
      where += ` AND YEAR(l.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(l.date) = ${data.month}`;
    }

    if (data.code != "" && data.code != undefined) {
      where += ` AND l.code = '${data.code}'`;
    }

    if (data.user_id != "" && data.user_id != undefined) {
      where += ` AND u.parent_id=${data.user_id}`;
    }

    if (data.self_user_id != "" && data.self_user_id != undefined) {
      where += ` AND u.id=${data.self_user_id}`;
    }

    pool.query(
      `select 
        l.id,DATE_FORMAT(l.date, "%d-%m-%Y")as date,l.code,l.name,ROUND(l.amount, 2)as amount,l.particular,l.cr_dr_type,l.type,DATE_FORMAT(l.added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime 
      FROM ledger l
      JOIN userlogin u ON u.id = l.user_id
      where 
        is_active = 1 
        ${where} 
      ORDER BY l.id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        } else {
          
          var obj = {
            totalRecord: totalRecord,
            data:results 
          };
          return callBack(null, obj);
        }
      }
    );
  },
  getAdminBySuperAdmin: (data, callBack) => {
    var totalRecord = 0;
    var totalAmount = 0;
    var openingBalance = 0;
    var closingBalance = 0;
    var where = '';
    var whereBalance = '';
    var whereClosingBalance = '';

    if (data.search != "") {
      whereBalance += ` AND (ll.code like '%${data.search}%' OR ll.name like '%${data.search}%')`;
      whereClosingBalance += ` AND (ll.code like '%${data.search}%' OR ll.name like '%${data.search}%')`;
    }

    if (data.month != "" && data.month != "All") {
      whereBalance += ` AND DATE(ll.date) <= '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(ll.date) <= '${moment('01'+ '-'+data.month + '-' + data.year, 'DD-MM-YYYY').endOf('month').format('YYYY-MM-DD')}'`;
    } else {
      whereBalance += ` AND DATE(ll.date) <= '${moment().startOf('month').format('YYYY-MM-DD')}'`;
      whereClosingBalance += ` AND DATE(ll.date) <= '${moment().endOf('month').format('YYYY-MM-DD')}'`;
    }

    if (data.code != "" && data.code != undefined) {
      whereBalance += ` AND ll.code = '${data.code}'`;
      whereClosingBalance += ` AND ll.code = '${data.code}'`;
    }

    var where = '';
    var subWhere = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      subWhere += ` AND YEAR(l.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(l.date) = ${data.month}`;
    }

    pool.query(
      `SELECT
      COUNT(id)as total, ROUND(SUM(total_amount), 2)as total_amount, ROUND(SUM(opeingBalance), 2)as opeingBalance, ROUND(SUM(closingBalance), 2)as closingBalance
    FROM(
      SELECT 
        pu.id,pu.username,pu.code, 
        (SELECT IFNULL(ROUND(sum(l.amount), 2), 0) FROM ledger l JOIN userlogin u ON u.id = l.user_id WHERE l.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount,
        (select IFNULL(ROUND(sum(ll.amount), 2), 0) FROM ledger ll where ll.is_active = 1 AND ll.parent_id = pu.id ${whereBalance})as opeingBalance,
        (select IFNULL(ROUND(sum(ll.amount), 2), 0) FROM ledger ll where ll.is_active = 1 AND ll.parent_id = pu.id ${whereClosingBalance})as closingBalance
      FROM userlogin pu 
      WHERE 
        pu.parent_id = ${data.user_id} 
        AND pu.type = 1 
    )as x`,
      (error, result, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = result[0].total;
        totalAmount = result[0].total_amount;
        
        pool.query(
          `SELECT 
            pu.id,pu.username,pu.code, 
            (SELECT IFNULL(ROUND(sum(l.amount), 2), 0) FROM ledger l JOIN userlogin u ON u.id = l.user_id WHERE l.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount 
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
              totalSheet: Math.round(totalAmount),
              openingBalance: Math.round(result[0].opeingBalance),
              closingBalance: Math.round(result[0].closingBalance),
              data: results
            };
            return callBack(null, obj);
          }
        );
      },
    );
  },
  getAdminData: (data, callBack) => {
    var where = '';
    var subWhere = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.name like '%${data.search}%')`;
    }

    if (data.year != "") {
      subWhere += ` AND YEAR(l.date) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      subWhere += ` AND MONTH(l.date) = ${data.month}`;
    }

    pool.query(
      `SELECT pu.id,pu.username,pu.code, 
      (SELECT IFNULL(ROUND(sum(l.amount), 2), 0) FROM ledger l JOIN userlogin u ON u.id = l.user_id WHERE l.is_active = 1 AND u.parent_id = pu.id AND u.type = 0${subWhere})as total_amount
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