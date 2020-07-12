var pool, mysql = require('promise-mysql')

function SerializeDataForUpdate(object) {
    return Object.entries(object).filter(e => e[1] != null).map(
        entry => `${mysql.escapeId(entry[0])} = ${mysql.escape(entry[1])}`).join(' , ')
}

function SerializeConditions(object) {
    return Object.entries(object).filter(e => e[1] != null).map(
        entry => `${mysql.escapeId(entry[0])} = ${mysql.escape(entry[1])}`).join(' and ')
}

function SerializeForInsertion(object, filterOutUndefined = true) {
    if (filterOutUndefined)
        object = Object.fromEntries(Object.entries(object).filter(e => e[1] != null))
    return {
        keys: Object.keys(object).map(key => mysql.escapeId(key)).join(" , "),
        values: Object.values(object).filter(e => e != null).map(value => mysql.escape(value)).join(" , ")
    }
}

function getPool({
    host = process.env.__MYSQL_HOST,
    port = process.env.__MYSQL_PORT,
    user = process.env.__MYSQL_USER,
    multipleStatements = true,
    password = process.env.__MYSQL_PASSWORD,
    database = process.env.__MYSQL_DATABASE,
    connectionLimit = 5,
} = {}) {
    if (!(host && port && user && password && database)) {
        throw Error("Missing Data!")
    }
    if (!pool) {
        pool = mysql.createPool({
            connectionLimit,
            host,
            port,
            user,
            password,
            database,
            multipleStatements
        });
    }

    return {
        pool,
        mysql
    }
}
module.exports = {
    getPool,
    SerializeConditions,
    SerializeDataForUpdate,
    SerializeForInsertion,
    escape: mysql.escape,
    escapeId: mysql.escapeId
}