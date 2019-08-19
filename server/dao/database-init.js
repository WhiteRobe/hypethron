const FILE_ERROR_CODE = 777;

/**
 * 用于初始化系统中的mysql数据库表结构及键入初始数据
 */
const fs = require("fs");

/**
 * 尝试建立表结构
 * @param sqlFileUrl slq文件路径
 * @param mysql mysql连接对象
 */
function buildTables(sqlFileUrl, mysql){
  try {
    let data = fs.readFileSync(sqlFileUrl); // 读取SQL语句
    let sentences = data.toString().replace(/\s+/gim, ' ').split(';');
    for(let i of sentences){
      // console.log(i+"\n");
      /* jshint loopfunc: true */
      if(i.length<=0) continue; // skip EMPTY_QUERY
      mysql.query(i+';', (err, res, fields) => {
        if (err) throw err;
        // else console.log(res, fields);
        // mysql.release();
      });
    }
  } catch (err) {
    console.error(err);
    process.exit(FILE_ERROR_CODE);
  }
}


module.exports = {
  buildTables
};