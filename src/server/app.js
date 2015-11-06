import express from 'express'
import WebTorrent from 'webtorrent'
import s3 from './modules/s3'

const app = express()
const client = new WebTorrent()

app.get ('/', function(req, res) {
  const { magnet } = req.params
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

        res.send('success ' + 'http://no37.s3.amazonaws.com/' + filename)
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
