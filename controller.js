const {getPool,SerializeForInsertion,SerializeConditions,SerializeDataForUpdate}=require('./connector');
var {pool}=getPool();
const controllers=new Map()
async function getTableController({table,database,tableNameSingular=table.endsWith('s')?table.slice(0,-1):table})
{
    pool=await pool
    let tableid=pool.escapeId(`${database}.${table}`)
    if(controllers.has(tableid))return controllers.get(tableid)

    const {columns,key}=await pool.query(`describe ${tableid}`).then(result=>(
        {columns:result.map(el=>el.Field).reduce((prev,curr)=>{prev.push(curr);return prev},[]),
            key:result.find(el=>el.Key=='PRI').Field
        }
    ));
        let nameSmallCase=tableNameSingular.toLowerCase()
        let namePascalCase=nameSmallCase[0].toUpperCase()+nameSmallCase.slice(1)
        let keyName=key[0].toUpperCase()+key.slice(1)
    /**
     * 
     */
    
    const cache=new Map()
    
            async function exists(arg){return !!await find(arg).catch(_=>false)}
            /**
             * 
             * @param Object Any or all of the columns key:values of the table
             */
            async function find(arg)
            {
                /**
                 * If the primary key is provided
                 */
                console.log('size before check',cache.size)
                try{
                if(key in arg && cache.has(arg[key]))return cache.get(arg[key])
                else
                {
                    for (let [_,record] of cache )
                    {
                        for (let column of columns)
                        {
                            /**
                             *  If the column value is provided but it does match a record in cache,
                             *  break and try for next record
                             */
                            if (column in arg &&  arg[column]!=record[column])
                            {
                                _=false
                                break
                            }
                            else _=true
                        }
                        if(_)return record
                    }
                }
                var serializedConds=SerializeConditions(arg)
                var record=await pool.query(`select * from ${tableid} where ${serializedConds}`)
                console.log('size before set',cache.size)
                cache.set(record[0][key],record[0])
                return record[0]
                }
                catch(e)
                {
                    return Error("Most Probably not found")
                }
            }
            async function getByKey(arg){return find({[key]:arg[key]})}
            async function update(arg)
            {
                var serializedForUpdate=SerializeDataForUpdate({...arg,[key]:undefined})
                var serializedForConds=SerializeConditions({[key]:arg[key]})
                var report=await  pool.query(`update ${tableid} set ${serializedForUpdate} where ${serializedForConds}`)
                cache.delete(arg[key])
                return  report
            }
            async function Add(arg)
            {
                var serializedForInsert=SerializeForInsertion(arg)
                var serializedForConds=SerializeConditions(arg)
                var report=await  pool.query(`insert into ${tableid} (${serializedForInsert.keys}) values(${serializedForInsert.values});
                                            select ${pool.escapeId(key)} from ${tableid} where ${serializedForConds};`)
                return  {[key]:report[1][0][key]}
            }
            async function remove(arg)
            {

                var serializedForConds=SerializeConditions({[key]:arg[key]})
                var report=await  pool.query(`delete from ${tableid} where ${serializedForConds}`)
                cache.delete(arg[key])
                return  report
            }
    let controller={
        __columns:columns,
        __key:key,
        __cache:cache,
        [nameSmallCase+'Exists']:exists,
        ['find'+namePascalCase]:find,
        ['get'+namePascalCase+'By'+keyName]:getByKey,
        ['update'+namePascalCase]:update,
        ['add'+namePascalCase]:Add,
        ['remove'+namePascalCase]:remove,

    }

    controllers.set(tableid,controller)
    return controller
}
 module.exports={getTableController}
