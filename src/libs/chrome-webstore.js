const request = require('request-promise')
module.exports = class ChromeWebStore {
  getCodeUrl (cid) {
    return 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=' + cid + '&redirect_uri=urn:ietf:wg:oauth:2.0:oob'
  }
  getAccessToken (cid, cs, code) {
    if (!(cid && cs && code)) reject(new Error('You should set 3 parameters'))
    return request.post('https://accounts.google.com/o/oauth2/token')
      .form({
        client_id: cid,
        client_secret: cs,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
      })
  }
  insertItem (token, fileBin) {
    return request.post({
      uri: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items',
      headers: {
        Authorization: 'Bearer ' + token,
        'x-goog-api-version': 2
      },
      body: fileBin
    })
  }
  updateItem (token, fileBin, itemId) {
    return request({
      method: 'PUT',
      uri: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + itemId,
      headers: {
        Authorization: 'Bearer ' + token,
        'x-goog-api-version': 2
      },
      body: fileBin
    })
  }
  publishItem (token, itemId, target = 'default') {
    return request.post({
      uri: 'https://www.googleapis.com//chromewebstore/v1.1/items/' + itemId + '/publish?publishTarget=' + target,
      headers: {
        Authorization: 'Bearer ' + token,
        'x-goog-api-version': 2
      }
    })
  }
  getRefreshToken (refreshToken, cid, cs) {
    return request.post('https://www.googleapis.com/oauth2/v3/token', {form: {
      client_id: cid,
      client_secret: cs,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }})
  }
}
