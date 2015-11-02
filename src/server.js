import app from './server/app'

const server = app.listen(process.env.PORT, () => {
  const { address, port } = server.address()
  console.log('Server listening at http://%s:%s', address, port)
})
