var isProduction = process.env.NODE_ENV !== 'production'
var moduleName = isProduction ? 'knox' : 'faux-knox'

var knox = require(moduleName)

const s3 = knox.createClient({
  key: process.env.ACCESS_KEY_ID,
  secret: process.env.SECRET_ACCESS_KEY,
  bucket: isProduction ? process.env.BUCKET_NAME : 'src/static/uploads'
})

export default s3
