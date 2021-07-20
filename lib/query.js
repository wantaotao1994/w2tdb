var  mysql = require("mysql");
var  fs = require("fs");
var  path = require("path");
const logger = require('./logger.js')

exports.do =async (conn1,conn2,tables)=>{
    var connection1 = mysql.createConnection(conn1);
    var connection2 = mysql.createConnection(conn2);
    connection1.connect();
    connection2.connect();
    var data1 = await showTables(connection1,tables);

    var  data2 =await  showTables(connection2,tables)
    var needCompare1 = await getDataFromDbResult(connection1,data1);
    var needCompare2=  await getDataFromDbResult(connection2,data2)
    var  reporter = compare(needCompare1,needCompare2)
    outResult(reporter)
    connection1.end();
    connection2.end();
}
function outResult (result){

    var template = require('art-template');
    var html = template(__dirname + '/../file/diff.html',result);
    var url = path.resolve('./');


    fs.writeFile(url+'/report.html',html, function (error) {
        if (error) {
            logger.error('写入失败')
        } else {
            logger.success('complete!')
        }
      })
}
async function getDataFromDbResult(conn,dbResult){
    const  res = new Map();
    const mapForIndexData = new Map()
    const mapForColumnIndexData = new Map()
    for (let index = 0; index < dbResult.length; index++) {
        const element = dbResult[index];
        const item = new column({
            dataType : element["DATA_TYPE"] ,
            columnType : element["COLUMN_TYPE"]  ,
            exTra : element["EXTRA"]  ,
            charactorMaximum : element["CHARACTER_MAXIMUM_LENGTH"] ,
            columnKey : element["COLUMN_KEY"] ,
            isNullable :element["IS_NULLABLE"] ,
            defaultValue :element["COLUMN_DEFAULT"],
            tableName : element["TABLE_NAME"],
            columnName :element["COLUMN_NAME"],
        })

        const key = item.tableName+"."+item.columnName
        
        const  tmpData = mapForIndexData.get(item.tableName)
        if(!tmpData){
                const indexDbData = await showTableIndex(conn,item.tableName)
                for (let index = 0; index < indexDbData.length; index++) {
                    const indexElement = indexDbData[index];
                    const indexElementItem = 
                    {
                        indexKeyType : indexElement["Index_type"],
                        indexKeyUnique : indexElement["Non_unique"]==0?'unique':'',
                        key : indexElement["Table"]+"."+indexElement["Column_name"]
                    }
                    mapForColumnIndexData.set(indexElementItem.key,indexElementItem)
                }   
                mapForIndexData.set(item.tableName,true)
        }

        const  indexInfo = mapForColumnIndexData.get(key)
        if(indexInfo){
            item.indexKeyType =  indexInfo.indexKeyType
            item.indexKeyUnique = indexInfo.indexKeyUnique
        }
       
        res.set(key,item);
    }
    return res;
}
 async function  showTables(conn,tables){
    return new Promise((resolve, reject)=>{
        var  condition = ` where  A.TABLE_SCHEMA = '${conn.config.database}' `
        if(tables&& tables.length>0){
            condition +=  " and  A.TABLE_NAME in ("
            for (let index = 0; index < tables.length; index++) {
                const element = tables[index];
                condition+= `'${element}'`
                if(index!=tables.length-1){
                    condition +=  ','
                }
            }
            condition +=  ")";
        }
        var sqlString = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS A  ${condition}     ORDER BY A.TABLE_SCHEMA, A.TABLE_NAME, A.ORDINAL_POSITION`;
        conn.query(sqlString, function (error, results, fields) {
            if (error){
                reject(error);
                return
            };
            resolve(results);
        });
   }) 
}

async function  showTableIndex(conn,tableName){
    logger.success(`Query ${tableName} indexs...`)
    return new Promise((resolve, reject)=>{
        const sqlString = `show index from \`${tableName}\``  ;
         conn.query(sqlString, function (error, results, fields) {
            if (error){
                reject(error);
                return
            };
            resolve(results);
        });
        

   }) 
       
}
function  compare(list1,list2){
    var  inList2ButDiff = [];


    for (var [key, value] of list1) {

        var table = inList2ButDiff.find(function(currentValue, index, arr){
            return  currentValue.tableName == value.tableName
        })
        if(!table){
            table ={
                tableName:value.tableName,
                columns:[],
            };
            inList2ButDiff.push(table);
        }

        const  data = list2.get(key);
        if(!data){
            table.columns.push({
                base: value,
                current:  {
                }
            })
        }else{
            //not  same 
            if(data.dataType!= value.dataType ||  data.charactorMaximum != value.charactorMaximum || data.indexKeyUnique!=value.indexKeyUnique || data.indexKeyType
                    != value.indexKeyType
                ){
                table.columns.push({
                    base: value,
                    current:  data
                })
            }
            
        }
    }

    return {inList2ButDiff};
}


class column{
    constructor(columnValue){
        this.dataType = columnValue.dataType || ""
        this.columnType = columnValue.dataType || ""
        this.exTra = columnValue.exTra || ""
        this.charactorMaximum = columnValue.charactorMaximum || ""
        this.columnKey = columnValue.columnKey || ""
        this.isNullable = columnValue.columnKey || ""
        this.defaultValue =columnValue.defaultValue 
        this.tableName = columnValue.tableName
        this.columnName = columnValue.columnName
        this.indexKeyType = columnValue.indexKeyType || ""
        this.indexKeyUnique = columnValue.indexKeyUnique || ""

    }
}