# chrome-webstore-manager

## INSTALL

`$ npm install -g chrome-webstore-manager`

## HOW TO USE

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

### :warning: `token` vs `refresh_token`

- `token`
  - Lifetime is **short**
  - It requires new token per request and you should authorize via browser.
- `refrash_token`
  - Lifetime is **very long**
  - You should set it if it works with CI.

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
