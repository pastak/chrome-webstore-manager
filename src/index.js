#!/usr/bin/env node

var readline = require('readline')
var child_process = require('child_process')
var fs = require('fs')
var program = require('commander')
var getToken = require('./libs/getToken')
var ChromeWebstore = require('./libs/chrome-webstore.js')
const chromeWebstore = new ChromeWebstore()

var getAccessToken = function (cid, cs, code) {
  chromeWebstore.getAccessToken(cid, cs, code)
    .then(function (data) {
      var json = JSON.parse(data)
      console.log('Your token: ' + json.access_token)
      console.log('Your refresh_token: ' + json.refresh_token)
      process.exit()
    })
}

program
  .version(require('../package.json').version)

program
  .command('token')
  .description('Get token for the first time')
  .option('--client_id [Client_ID]', 'Your Client ID')
  .option('--client_secret [Client_Secret]', 'Your Client Secret')
  .option('--code [CODE]', 'Your authorized code')
  .action(function (options) {
    var rli = readline.createInterface(process.stdin, process.stdout)
    const cid = options.client_id
    const cs = options.client_secret
    if (!(cid && cs)) {
      console.error('Require Client ID and Client Secret')
      process.exit()
    }
    if (options.code) {
      return getAccessToken(cid, cs, options.code)
    }
    const getCodeUrl = chromeWebstore.getCodeUrl(cid)
    child_process.exec('open "' + getCodeUrl + '"')
    rli.setPrompt('Your CODE: ')
    rli.on('line', function (code) {
      getAccessToken(cid, cs, code)
    })
    rli.prompt()
  })

program
  .command('insert [zipFile]')
  .description('create new item on Chrome Web Store')
  .option('-t, --token [YOUR_TOKEN]', 'Your token')
  .action(function (zipFile, options) {
    var token = getToken(options)
    var fileBin = fs.readFileSync(zipFile)
    chromeWebstore.insertItem(token, fileBin).then(function (data) {
      var json = JSON.parse(data)
      if (json.itemError) {
        console.error(json.itemError)
        return process.exit(1)
      }
      console.log(json.id)
    })
  })

program
  .command('update [itemId] [zipFile]')
  .description('update your item')
  .option('-t, --token [YOUR_TOKEN]', 'Your token')
  .action(function (itemId, zipFile, options) {
    var fileBin = fs.readFileSync(zipFile)
    var token = getToken(options)
    chromeWebstore.updateItem(token, fileBin, itemId).then(function (data) {
      var json = JSON.parse(data)
      if (json.itemError) {
        console.error(json.itemError)
        return process.exit(1)
      }
      console.log(json.id)
    })
  })

program
  .command('publish [itemId]')
  .description('make item publish')
  .option('-t, --token [YOUR_TOKEN]', 'Your token')
  .option('--target [TARGET_TYPE]', '"trustedTesters" or "default"')
  .action(function (itemId, options) {
    var token = getToken(options)
    var target = options.target || 'default'
    chromeWebstore.publishItem(token, itemId, target).then(function (data) {
      var json = JSON.parse(data)
      if (json.itemError) {
        console.error(json.itemError)
        return process.exit(1)
      }
      console.log(json.id)
    })
  })
program
  .command('refresh_token')
  .description('Get token for the first time')
  .option('--client_id [Client_ID]', 'Your Client ID')
  .option('--client_secret [Client_Secret]', 'Your Client Secret')
  .option('--refresh_token [Refresh_Token]', 'Your Refresh Token')
  .action(function (options) {
    const cid = options.client_id
    const cs = options.client_secret
    if (!(cid && cs)) {
      console.error('Require Client ID and Client Secret')
      process.exit()
    }
    if (!(process.env.WEBSTORE_REFRESH_TOKEN || options.refresh_token)) {
      console.error('Require refresh_token')
      process.exit()
    }
    var refreshToken = options.refresh_token || process.env.WEBSTORE_REFRESH_TOKEN
    chromeWebstore.getRefreshToken(refreshToken, cid, cs).then(function (data) {
      var json = JSON.parse(data)
      console.log(json.access_token)
    })
  })

program.parse(process.argv)

if (!program.args.length) {
  program.help()
}
