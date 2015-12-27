import express from 'express'
import WebTorrent from 'webtorrent'
import s3 from './modules/s3'
import bodyParser from 'body-parser'

const app = express()
const client = new WebTorrent()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/../static'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/index.html')
})

app.post('/download', function(req, res) {
  const { magnet_uri } = req.body

  if (!magnet_uri) {
    return res.status(400).send("bad request")
  }

  client.add(magnet_uri, function (torrent) {
    var torrentUrls = []

    torrent.files.forEach((file) => {
      const read = file.createReadStream()
      const headers = makeHeaders(file.length)
      const filename = file.name

      s3.putStream(read, filename, headers, function (err, s3res) {
        if (err) {
          return res.send('error')
        }

        const url = makeS3Url(filename)

        if (torrentUrls.length === torrent.files.length - 1) {
          return res.json({
            success: true,
            torrents: [...torrentUrls, url]
          })
        } else {
          return torrentUrls.push(url)
        }
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
