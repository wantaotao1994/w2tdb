module.exports = {    
  modules: {
       dbAlias:{
           test1:{
                  connectionLimit : 10,
                  host            : 'host',
                  user            : 'user',
                  password        : 'password',
                  database        : 'database',
                  port:  3320
            },
            test2:{
              connectionLimit : 10,
              host            : 'host',
              user            : 'user',
              password        : 'password',
              port:  3320,
              database        : 'database'
            }
       }
  }
}