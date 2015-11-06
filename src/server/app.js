import express from 'express'
import WebTorrent from 'webtorrent'
import s3 from './modules/s3'
import bodyParser from 'body-parser'

const app = express()
const client = new WebTorrent()

app.use(bodyParser())
app.use(express.static(__dirname + '/../static'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/index.html')
})

app.post('/', function(req, res) {
  const { magnet } = req.body

  client.add(magnet, function (torrent) {
    torrent.files.forEach((file) => {
      const read = file.createReadStream()
      const headers = makeHeaders(file.length)
      const filename = file.name

      s3.putStream(read, filename, headers, function (err, s3res) {
        if (err) {
          console.log(err)
          return res.send('error')
        }

        res.json({
          success: true,
          url: makeS3Url(filename)
        })
      })
    })
  })
})

function makeS3Url (filename) {
  return 'http://' + process.env.BUCKET_NAME + '.s3.amazonaws.com/' + filename
}

function makeHeaders (length) {
  return {
    'x-amz-acl': 'public-read',
    'Content-Length': length
  }
}

export default app
