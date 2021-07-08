# w2tdb 
Compare two database or tables;

# How to use 
> npm i w2tdb -g

> w2tdb init 


Edit Config file :
```
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
```
>w2tdb do test1 test2  or w2tdb do test1 test2 -t [tables...]