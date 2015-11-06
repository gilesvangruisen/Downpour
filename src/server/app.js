import express from 'express'
import WebTorrent from 'webtorrent'
import s3 from './modules/s3'
import bodyParser from 'body-parser'

const app = express()
const client = new WebTorrent()

app.use(bodyParser())

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
          url: 'http://no37.s3.amazonaws.com/' + filename
        })
      })
    })
  })
})

function makeHeaders (length) {
  return {
    'x-amz-acl': 'public-read',
    'Content-Length': length
  }
}

export default app
