#!/usr/bin/env node

var readline = require('readline')
var child_process = require('child_process')
var fs = require('fs')
var program = require('commander')
var request = require('request-promise')
var getToken = require('./libs/getToken')

var getAccessToken = function (cid, cs, code) {
  request.post('https://accounts.google.com/o/oauth2/token')
    .form({
      client_id: cid,
      client_secret: cs,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
    })
    .then(function (data) {
      var json = JSON.parse(data)
      console.log('Your token: ' + json.access_token)
      console.log('Your refresh_token: ' + json.access_token)
      process.exit()
    })
}

program
  .version(require('./package.json').version)

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
    const getCodeUrl = 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=' + cid + '&redirect_uri=urn:ietf:wg:oauth:2.0:oob'
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
    request.post({
      uri: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items',
      headers: {
        Authorization: 'Bearer ' + token,
        'x-goog-api-version': 2
      },
      body: fileBin
    }).then(function (data) {
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
    request({
      method: 'PUT',
      uri: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + itemId,
      headers: {
        Authorization: 'Bearer ' + token,
        'x-goog-api-version': 2
      },
      body: fileBin
    }).then(function (data) {
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
    request.post({
      uri: 'https://www.googleapis.com//chromewebstore/v1.1/items/' + itemId + '/publish?publishTarget=' + target,
      headers: {
        Authorization: 'Bearer ' + token,
        'x-goog-api-version': 2
      }
    }).then(function (data) {
      var json = JSON.parse(data)
      if (json.itemError) {
        console.error(json.itemError)
        return process.exit(1)
      }
      console.log(json.id)
    })
  })

program.parse(process.argv)

if (!program.args.length) {
  program.help()
}
