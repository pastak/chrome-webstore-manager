#!/usr/bin/env node

var readline = require('readline')
var fs = require('fs')
var program = require('commander')
var open = require('open')
var getToken = require('./libs/getToken')
var ChromeWebstore = require('./libs/chrome-webstore.js')

var getAccessToken = function (cid, cs, code) {
  const chromeWebstore = new ChromeWebstore(cid, cs)
  chromeWebstore.getAccessToken(code)
    .then(function (json) {
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
      process.exit(1)
    }
    if (options.code) {
      return getAccessToken(cid, cs, options.code)
    }
    const chromeWebstore = new ChromeWebstore(cid, cs)
    const getCodeUrl = chromeWebstore.getCodeUrl()
    open(getCodeUrl)
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
    const chromeWebstore = new ChromeWebstore()
    chromeWebstore.insertItem(token, fileBin).then(function (json) {
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
    const chromeWebstore = new ChromeWebstore()
    chromeWebstore.updateItem(token, fileBin, itemId).then(function (json) {
      if (json.itemError) {
        console.error(json.itemError)
        return process.exit(1)
      }
      console.log(json.id)
    })
  })

program
  .command('get [itemId]')
  .description('get item from chrome webstore')
  .option('-t, --token [YOUR_TOKEN]', 'Your token')
  .option('--projection [PROJECTION_TYPE]', '"DRAFT" or "PUBLISHED"')
  .action(function (itemId, options) {
    const token = getToken(options)
    var projection = options.projection || 'DRAFT'
    const chromeWebstore = new ChromeWebstore()
    chromeWebstore.getItem(token, itemId, projection).then(function (json) {
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
    const chromeWebstore = new ChromeWebstore()
    chromeWebstore.publishItem(token, itemId, target).then(function (json) {
      if (json.itemError) {
        console.error(json.itemError)
        return process.exit(1)
      }
      console.log(json.id)
    })
  })
program
  .command('refresh_token')
  .description('Get token by refresh_token')
  .option('--client_id [Client_ID]', 'Your Client ID')
  .option('--client_secret [Client_Secret]', 'Your Client Secret')
  .option('--refresh_token [Refresh_Token]', 'Your Refresh Token')
  .action(function (options) {
    const cid = options.client_id
    const cs = options.client_secret
    if (!(cid && cs)) {
      console.error('Require Client ID and Client Secret')
      process.exit(1)
    }
    if (!(process.env.WEBSTORE_REFRESH_TOKEN || options.refresh_token)) {
      console.error('Require refresh_token')
      process.exit(1)
    }
    var refreshToken = options.refresh_token || process.env.WEBSTORE_REFRESH_TOKEN
    const chromeWebstore = new ChromeWebstore(cid, cs)
    chromeWebstore.getRefreshToken(refreshToken).then(function (json) {
      console.log(json.access_token)
    })
  })

program.parse(process.argv)

if (!program.args.length) {
  program.help()
}
