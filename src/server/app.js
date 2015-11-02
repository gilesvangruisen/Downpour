import express from 'express'
import WebTorrent from 'webtorrent'
import s3 from './modules/s3'

const app = express()
const client = new WebTorrent()

var magnet = 'magnet:?xt=urn:btih:2b12ce09236526a728c6974c0d89d52860e82daa&dn=Major+Lazer+x+DJ+Snake+feat.+M%26Oslash%3B+-+Lean+On.mp3&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969'

app.get ('/', function(req, res) {
  client.add(magnet, function (torrent) {
    torrent.files.forEach((file) => {
      var read = file.createReadStream()
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
