# chrome-webstore-manager

[![](https://nodei.co/npm-dl/chrome-webstore-manager.png?months=3)](https://www.npmjs.com/package/chrome-webstore-manager)

[![](https://nodei.co/npm/chrome-webstore-manager.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/chrome-webstore-manager)

## INSTALL

`$ npm install -g chrome-webstore-manager`

## HOW TO USE

### Create new item

- `$ chrome-webstore-manager insert /path/to/your_extension.zip`
  - **caution**: it requires `zip` NOT `crx`
- return value: chrome-web-store-item-id

Only this command, your items is under draft. So you should publish item. I write about it on below.

### Publish item

- `$ chrome-webstore-manager publish ITEM_ID`
  - `ITEM_ID`: chrome-web-store-item-id

### Update item

- `$ chrome-webstore-manager update ITEM_ID /path/to/your_extension.zip`
  - `ITEM_ID`: chrome-web-store-item-id

## Example

Sample webapp for release chrome extenison on heroku

https://github.com/pastak/chrome-extension-release-heroku

## Use on NodeJS

```js
const ChromeWebstore = require('chrome-webstore-manager')
const fileBin = fs.readFileSync('./extension.zip')
// chrome web store item id
const itemId = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

// Initialize with ClientID and ClinetSecret
const chromeWebstore = new ChromeWebstore(client_id, client_secret)

// Get authorize URL
const getCodeUrl = chromeWebstore.getCodeUrl()

const code = open_browser_and_input_authorized_code(getCodeUrl)

// Get OAuth access token
const token = chromeWebstore.getAccessToken(code)

// Create new item
chromeWebstore.insertItem(token, fileBin).then((data) => { do_something })

// Update item
chromeWebstore.updateItem(token, fileBin, itemId).then((data) => { do_something })

// Make item publish
// target is 'trustedTesters' OR 'default'. default is 'default'
const target = 'trustedTesters'
chromeWebstore.publishItem(token, itemId, target).then((data) => { do_something })

// Get new token with refresh_token
chromeWebstore.getRefreshToken(refreshToken).then(function (data) {
  const json = JSON.parse(data)
  const newToken = json.access_token
})

```

## More Info about token

### Get access token

- Prepare the client ID and client secret to use Chrome Web Store API according to https://developer.chrome.com/webstore/using_webstore_api#beforeyoubegin
- You can get access token via this commands.
  - `$ chrome-webstore-manager token --client_id [YOUR_CLIENT_ID] --client_secret [YOUR_CLIENT_SECRET]`
  - After a while, open your browser then accept Google OAuth.

### Set your access_token

- You can pass `access_token` to command.
  - You can set command's optional value `-t` or `--token`
  - You can set `access_token` as environment value named `WEBSTORE_TOKEN`
    - If you use it on \*CI, it is useful `export WEBSTORE_TOKEN=[YOUR_ACCESS_TOKEN]`

### Get access token using refresh token

- You get new access token with `$ chrome-webstore-manager refresh_token --client_id [YOUR_CLIENT_ID] --client_secret [YOUR_CLIENT_SECRET] --refresh_token [YOUR_REFRESH_TOKEN]`
  - You can use environment variable `WEBSTORE_REFRESH_TOKEN` instead of `refresh_token`

**Usage Example**

`$ WEBSTORE_TOKEN=$(chrome-webstore-manager refresh_token ...) chrome-webstore-manager update ITEM_ID extension.zip`
