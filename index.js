if (process.env.NODE_ENV != 'production')
    require('dotenv').config()
const controller = require('./connector')
/**
 * Description
 */

module.exports = controller