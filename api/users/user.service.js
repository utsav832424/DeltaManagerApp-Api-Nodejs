const pool = require("../../config/database");
var moment = require('moment');

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into  userlogin(parent_id,username,password,code,pancard,admin_sharing,user_sharing,type,isactive,added_datetime) values(?,?,?,?,?,?,?,?,?,?)',
      [
        data.parent_id,
        data.name,
        data.password,
        data.code,
        data.pancard,
        data.admin_sharing,
        data.user_sharing,
        data.type,
        data.isactive,
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
  getUsers: (data, callBack) => {
    var totalRecord = 0;
    var where = '';
    if (data.search != "") {
      where = ` AND (code like '%${data.search}%' OR username like '%${data.search}%' OR pancard like '%${data.search}%')`;
    }

    if (data.user_id != "") {
      where += ` AND parent_id = ${data.user_id}`;
    }
    pool.query(
      `select count(*)as total FROM  userlogin where type = 0 ${where} ORDER BY id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
      }
    );
    pool.query(
      `select id,username,code,pancard,admin_sharing,user_sharing,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime,isactive FROM  userlogin where type = 0 ${where} ORDER BY id desc limit ${data.offset},${data.length}`,
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
  getDownloadUsers: (data, callBack) => {
    var totalRecord = 0;
    var where = '';
    if (data.search != "") {
      where = ` AND (code like '%${data.search}%' OR username like '%${data.search}%' OR pancard like '%${data.search}%')`;
    }
    if (data.user_id != "") {
      where += ` AND parent_id=${data.user_id}`;
    }

    if (data.year != "" && data.year != undefined) {
      where += ` AND YEAR(added_datetime) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All" && data.month != undefined) {
      where += ` AND MONTH(added_datetime) = ${data.month}`;
    }

    pool.query(
      `select id,username,code,pancard,admin_sharing,user_sharing,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime,isactive FROM  userlogin where type = 0 ${where} ORDER BY id desc`,
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
  getUserByUserId: (id, callBack) => {
    pool.query(
      'select id,username,password,code,pancard,admin_sharing,user_sharing,type, FROM userlogin where id = ?',
      [id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  updateUser: (data, callBack) => {
    if (data.password != "") {
      pool.query(
        `update userlogin set username = '${data.name}', password = '${data.password}',pancard = '${data.pancard}',admin_sharing = '${data.admin_sharing}',user_sharing = '${data.user_sharing}' where id = ${data.user_id} `,
        [],
        (error, results, fields) => {
          if (error) {
            callBack(error);
          }
          return callBack(null, results);
        }
      );
    } else {
      pool.query(
        `update userlogin set username = '${data.name}',pancard = '${data.pancard}',admin_sharing = '${data.admin_sharing}',user_sharing = '${data.user_sharing}' where id = ${data.user_id} `,
        [],
        (error, results, fields) => {
          if (error) {
            callBack(error);
          }
          return callBack(null, results);
        }
      );
    }
    
  },
  /* deleteUser: (data, callBack) => {
    pool.query(
      'delete from userlogin where id = ?',
      [data.id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  }, */
  getUserByUserEmail: (data, callBack) => {
    if (data.parent_code == undefined) {
      pool.query(
        `SELECT *, IFNULL((SELECT username FROM userlogin ul where u.parent_id = ul.id),'') as parent_name FROM userlogin u WHERE code = '${data.email}'`,
        [data.email],
        (error, results, fields) => {
          if (error) {
            callBack(error);
          }
          return callBack(null, results[0]);
        }
      );
    } else {
      pool.query(
        `SELECT * , IFNULL((SELECT username FROM userlogin ul where u.parent_id = ul.id),'') as parent_name  FROM userlogin WHERE code = '${data.email}' AND parent_id = (select id from userlogin where code = '${data.parent_code}')`,
        [data.email],
        (error, results, fields) => {
          if (error) {
            callBack(error);
          }
          return callBack(null, results[0]);
        }
      );
    }
  },
  checkUser: (data, callBack) => {
    // console.log(`select * from userlogin where code = '${data.code}' AND isactive = 1`);
    pool.query(
      `select * from userlogin where code = '${data.code}' AND isactive = 1`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  createbulkuser: (data, callBack) => {
    pool.query(
      'insert into userlogin(parent_id,code,username,password,user_sharing,admin_sharing,pancard,type,isactive) values ?',
      [data],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  updatePassword: (data, callBack) => {
    pool.query(
      `update userlogin set password = '${data.password}' where id = ${data.user_id} `,
      [],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteUser: (data, callBack) => {
    // `update userlogin set isactive = '0' where id = ${data.user_id} `,
    pool.query(
      `DELETE FROM userlogin WHERE id = ${data.user_id} `,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        pool.query(
          `DELETE FROM sheet WHERE user_id = ${data.user_id}`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        );
        pool.query(
          `DELETE FROM salary WHERE user_id = ${data.user_id}`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        );
        pool.query(
          `DELETE FROM deposit WHERE user_id = ${data.user_id}`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        );
        pool.query(
          `DELETE FROM withdrawal WHERE user_id = ${data.user_id}`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        );
        pool.query(
          `DELETE FROM ledger WHERE user_id = ${data.user_id}`,
          [],
          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
          }
        );
        return callBack(null, results);
      }
    );
  },
  getUserByUsingCode: (data, callBack) => {
    var where = '';
    if (data.user_id != undefined && data.user_id != "") {
      where = `AND parent_id=${data.user_id} AND type = 0 AND isactive = 1`;
    }
    // console.log(`select id,username,code, IFNULL(concat(code ,' - ', (select code from userlogin where id = u.parent_id)), code)as full_code_name from userlogin u where code like '${data.code}%' ${where}`);
    pool.query(
      `select id,username,code,admin_sharing,user_sharing, IFNULL(concat(code ,' - ', username), code)as full_code_name from userlogin u where code like '${data.code}%' ${where}`,
      [],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  changeStatusUser: (data, callBack) => {
    pool.query(
      `update userlogin set isactive = '${data.status}' where id = ${data.user_id} `,
      [],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getAdminBySuperAdmin: (data, callBack) => {
    var totalRecord = 0;
    var where = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.username like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(pu.added_datetime) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(pu.added_datetime) = ${data.month}`;
    }
    
    pool.query(
      `SELECT count(*)as total,pu.id,pu.username,pu.code FROM userlogin pu WHERE pu.parent_id = ${data.user_id} AND pu.type = 1${where}`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
        
        pool.query(
          `SELECT pu.id,pu.username,pu.code
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
              data: results
            };
            return callBack(null, obj);
          }
        );
      }
    );
  },
  getAdminData: (data, callBack) => {
    var totalRecord = 0;
    var where = '';

    if (data.search != "") {
      where += ` AND (pu.code like '%${data.search}%' OR pu.username like '%${data.search}%')`;
    }

    if (data.year != "") {
      where += ` AND YEAR(pu.added_datetime) = ${data.year}`;
    }

    if (data.month != "" && data.month != "All") {
      where += ` AND MONTH(pu.added_datetime) = ${data.month}`;
    }
    
    pool.query(
      `SELECT pu.id,pu.username,pu.code
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
  createAdmin: (data, callBack) => {
    pool.query(
      'insert into  userlogin(parent_id,username,password,code,address,mobile,group_id,type,isactive,added_datetime) values(?,?,?,?,?,?,?,?,?,?)',
      [
        data.parent_id,
        data.name,
        data.password,
        data.code,
        data.address,
        data.mobile,
        data.group_id,
        1,
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
  createSuperAdmin: (data, callBack) => {
    pool.query(
      'insert into  userlogin(username,password,code,type,isactive,added_datetime) values(?,?,?,?,?,?)',
      [
        data.name,
        data.password,
        data.code,
        2,
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
  getAllAdmin: (data, callBack) => {
    var totalRecord = 0;
    var where = '';
    if (data.search != "") {
      where = ` AND (code like '%${data.search}%' OR username like '%${data.search}%' OR pancard like '%${data.search}%')`;
    }

    pool.query(
      `select count(*)as total FROM  userlogin where type != 0 ${where} ORDER BY id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        totalRecord = results[0].total;
      }
    );
    pool.query(
      `select id,username,code,IFNULL(pancard,'')as pancard,type,IFNULL(admin_sharing,'') as admin_sharing,IFNULL(user_sharing,'')as user_sharing,IFNULL(address,'')as address,IFNULL(mobile,'')as mobile,IFNULL(group_id,'')as group_id,DATE_FORMAT(added_datetime, "%e-%m-%Y %h:%i:%s %p")as added_datetime,isactive FROM  userlogin where type != 0 ${where} ORDER BY id desc limit ${data.offset},${data.length}`,
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
  updateAdminUser: (data, callBack) => {
    if (data.password != "") {
      if (data.type == 1) {
        pool.query(
          `update userlogin set username = '${data.name}', password = '${data.password}',address = '${data.address}',mobile = '${data.mobile}',group_id = '${data.group_id}',admin_sharing = '${data.admin_sharing}',user_sharing = '${data.user_sharing}' where id = ${data.user_id} `,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            return callBack(null, results);
          }
        );
      } else {
        pool.query(
          `update userlogin set username = '${data.name}', password = '${data.password}' where id = ${data.user_id} `,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            return callBack(null, results);
          }
        );
      }
    } else {
      if (data.type == 1) {
        pool.query(
          `update userlogin set username = '${data.name}',address = '${data.address}',mobile = '${data.mobile}',group_id = '${data.group_id}',admin_sharing = '${data.admin_sharing}',user_sharing = '${data.user_sharing}' where id = ${data.user_id} `,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            return callBack(null, results);
          }
        );
      } else {
        pool.query(
          `update userlogin set username = '${data.name}' where id = ${data.user_id} `,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            return callBack(null, results);
          }
        );

      }
    }
  },
  getSuperAdmin: (callBack) => {
    pool.query(
      `select id,code,username FROM  userlogin where type = 2 AND isactive = 1 ORDER BY id desc`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  }
}