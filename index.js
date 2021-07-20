#!/usr/bin/env node

const path = require('path')
const os = require('os')
const fs = require('fs')

const logger = require('./lib/logger.js')
const success = logger.success
const localAssert = (local, type) => (boolean, type = 'error', msg, ...arg) =>
  logger.assert(boolean, type, msg, local, ...arg)
const assert = localAssert('compare-database')
const localLogger = (local, type) => (msg, end = true, cb) =>
  logger[type](msg, local, end, cb)
const warning = localLogger('compare-database', 'warning')
const error = localLogger('compare-database', 'error')

const { program } = require('commander');
const { config } = require('process')
program.version('0.0.1');






//const options = program.opts();




program
    .command('do [alias1] [alias2]')
    .option('-t, --tables [tables...]', 'choose tables')
    .description('do compare')
    .action((alias1, alias2,tables) => {

            let query =  require("./lib/query")
            let config = require(getConfigPath("compareDb.config")) 

            query.do(config.modules.dbAlias[alias1],config.modules.dbAlias[alias2],tables.tables)

    });

    
program
.command('init')
.description('init config file')
.action(() => {
    var  data =
    `module.exports = {    
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
    }`
    var url = path.resolve('./');

    fs.writeFile(url+'/compareDb.config.js',data, function (error) {
        if (error) {
          logger.error('写入失败')
        } else {
          logger.success('写入失败')
        }
      })

});
program.parse(process.argv);

    



function getConfigPath({ config } = {}) {
    let configPath = path.join(process.cwd(),'compareDb.config.js')
    if (config) configPath = path.resolve(config)
    if (!fs.existsSync(configPath))
      return error(
        "The configuration file does not exist. You can enter 'compare-db init' to generate a reference configuration in the current directory."
      )
    return configPath
}