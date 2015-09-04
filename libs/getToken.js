module.exports = function (options) {
  if (typeof options === 'string') {
    return options
  }
  if (typeof options === 'object' && options.token) {
    return options.token
  }
  if (process.env.WEBSTORE_TOKEN) {
    return process.env.WEBSTORE_TOKEN
  }
  console.error("Require Chrome Webstore API access_token. Please set into `--token` or ENV['WEBSTORE_TOKEN']")
  process.exit()
}
