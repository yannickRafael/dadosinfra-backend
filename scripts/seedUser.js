require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const bcrypt = require('bcryptjs')
const connectDB = require('../src/config/db')
const User = require('../src/models/User')

const run = async () => {
  await connectDB()

  const passwordHash = await bcrypt.hash('Admin1234!', 12)

  await User.findOneAndUpdate(
    { email: 'admin@dadosinfra.mz' },
    { email: 'admin@dadosinfra.mz', passwordHash, role: 'admin' },
    { upsert: true }
  )

  console.log('Admin user seeded')
  process.exit(0)
}

run()
