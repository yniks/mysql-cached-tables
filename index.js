if (process.env.NODE_ENV!='production')
    require('dotenv')
const controller=require('./connector')
/**
 * Description
 */

module.exports=controller
