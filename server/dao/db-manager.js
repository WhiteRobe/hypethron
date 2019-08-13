/**
 * MySQL连接池管理类
 */
class MySQLPoolManager {
  constructor(DBPool) {
    this._pool = DBPool;

    this.asyncBeginTransaction = this.asyncBeginTransaction.bind(this);
    this.asyncQuery = this.asyncQuery.bind(this);
    this.exit = this.exit.bind(this);

    // Alias
    this.query = this.asyncQuery;
    this.beginTransaction = this.asyncBeginTransaction;
  }

  get pool() {
    return this._pool;
  }

  set pool(DBPool) {
    // 设置新池之前先退出旧池
    this.exit()
      .then(res => {
        this._pool = DBPool;
      })
      .reject(err => {
        console.warn("Set new db-pool fail: fail to disconnect from old one.", err);
      });
  }


  /**
   * 获取一个开启了事务的链接
   * Alias: beginTransaction
   * @return {Promise<any>}
   */
  asyncBeginTransaction() {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        conn.beginTransaction(function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(new SyncTransactionConnection(conn));
            }
          }
        );
      });
    });
  }

  /**
   * 异步查询，返回一个Promise便于使用await方法
   * Alias: query
   * @param sql
   * @param values
   * @return {Promise<any>}
   */
  asyncQuery(sql, values) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, values, (error, result, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve({result, fields});
          }
        }
      );
    });
  }

  /**
   * 关闭连接池
   * @return {Promise<any>}
   */
  exit() {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve("Success!");
        }
      });
    });
  }
}

/**
 * 同步事务类
 */
class SyncTransactionConnection {
  constructor(connection) {
    this._connection = connection;

    this.query = this.query.bind(this);
    this.commit = this.commit.bind(this);
    this.rollback = this.rollback.bind(this);
    this.release = this.release.bind(this);
    this.trySyncCommitAndRelease = this.trySyncCommitAndRelease.bind(this);
  }

  get connection() {
    return this._connection;
  }

  set connection(connection) {
    try{
      this.rollback().catch(err => {throw err});
      this.release();
    } catch (err) {
      console.error(err);
    } finally {
      this._connection = connection;
    }
  }

  query(sql, values) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, values, (error, result, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve({result, fields});
          }
        }
      );
    });
  }

  commit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err, res) => {
        if(err){
          reject(err)
        } else{
          resolve(res);
        }
      });
    });
  }

  rollback() {
    return new Promise((resolve, reject) => {
      this.connection.rollback((err, res) => {
        if(err){
          reject(err)
        } else{
          resolve(res);
        }
      });
    });
  }

  release() {
    try{
      this.connection.release();
    } catch (err) {
      throw err;
    }
  }

  async trySyncCommitAndRelease(){
    let that = this;
    await that.commit().catch(err => {
      that.rollback().catch(err => {
        throw err;
      });
      that.release();
      throw err;
    });
    that.release();
  }
}

module.exports = {
  MySQLPoolManager
};