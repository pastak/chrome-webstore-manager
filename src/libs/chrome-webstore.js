const request = require('request-promise')
module.exports = class ChromeWebStore {
  constructor (cid, cs, redirectUrl) {
    this.cid = cid
    this.cs = cs
    this.redirectUrl = redirectUrl || 'urn:ietf:wg:oauth:2.0:oob'
  }
  getCodeUrl (redirectUrl, state) {
    state = state || ''
    state = encodeURIComponent(state)
    return 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=' + this.cid + '&state' + state + '&redirect_uri=' + (redirectUrl || this.redirectUrl)
  }
  getAccessToken (code, redirectUrl) {
    return request.post('https://accounts.google.com/o/oauth2/token')
      .form({
        client_id: this.cid,
        client_secret: this.cs,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUrl || this.redirectUrl
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
  getRefreshToken (refreshToken) {
    return request.post('https://www.googleapis.com/oauth2/v3/token', {form: {
      client_id: this.cid,
      client_secret: this.cs,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }})
  }
}
