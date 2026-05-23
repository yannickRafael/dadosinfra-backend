require('dotenv').config()
const connectDB = require('./config/db')
const app = require('./app')

const start = async () => {
  await connectDB()
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start()
