const pool = require("../../config/database");

module.exports = {
  create: (data, callBack) => {
    pool.query(
      'insert into sheet(user_id,parent_id,code,date,name,segment,sheet,admin_sharing,user_sharing,upload_sheet) values(?,?,?,?,?,?,?,?,?,?)',
      [
        data.user_id,
        data.parent_id,
        data.code,
        data.date,
        data.name,
        data.segment,
        data.sheet,
        data.admin_sharing,
        data.user_sharing,
        1,
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
  getUserByUsingCode: (data, callBack) => {

    var where = '';
    if (data.user_id != undefined) {
      where = ` AND parent_id=${data.user_id}`;
    }
    
    pool.query(
      `select id,parent_id,username,code,admin_sharing,user_sharing from userlogin u where code like '${data.code}' ${where} AND type = 0 AND isactive = 1`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  checkSheetIsUpload: (data, callBack) => {
    pool.query(
      `SELECT id FROM sheet WHERE MONTH(date) = ${data.month} AND upload_sheet = 1 AND parent_id = ${data.user_id}`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteOldSheetEntry: (data, callBack) => {
    pool.query(
      `DELETE FROM sheet WHERE id IN (${data.ids})`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        pool.query(
          `DELETE FROM ledger WHERE ids IN (${data.ids}) AND type = 1`,
          (error, results, fields) => {
            if (error) {
              callBack(error);
            }
            return callBack(null, results);
          }
        );
      }
    );
  },
  checkSuperAdminSheetIsUpload: (data, callBack) => {
    pool.query(
      `SELECT 
        id 
      FROM sheet
      WHERE 
        MONTH(date) = ${data.month} 
        AND upload_sheet = 1 
        AND code = '${data.code}'`,
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
};