var  mysql = require("mysql");
var  fs = require("fs");
var  path = require("path");

exports.do = (conn1,conn2,tables)=>{
    var connection1 = mysql.createConnection(conn1);
    var connection2 = mysql.createConnection(conn2);
    connection1.connect();
    connection2.connect();
      showTables(connection1,tables).then((results1)=>{
           var  data1 =  getDataFromDbResult(results1)
            showTables(connection2,tables).then((results2)=>{
                var  data2 =  getDataFromDbResult(results2)
                var  diff = compare(data1,data2)
                outResult(diff)
                connection1.end();
                connection2.end();
          }).catch(err=>{
            console.error(err)
          })

      }).catch(err=>{
          console.error(err)
      })


}
function outResult (result){

    var template = require('art-template');
    var html = template(__dirname + '/../file/diff.html',result);
    var url = path.resolve('./');


    fs.writeFile(url+'/reportName.html',html, function (error) {
        if (error) {
          console.log('写入失败')
        } else {
          console.log('ok!!')
        }
      })
}
function getDataFromDbResult(dbResult){
    const  res = new Map();
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
            columnName :element["COLUMN_NAME"]
        })

        res.set(item.tableName+"."+item.columnName,item);
    }

    return res;
}
function  showTables(conn,tables){
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
            if(data.dataType!= value.dataType ||  data.charactorMaximum != value.charactorMaximum){
            
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
    }
}