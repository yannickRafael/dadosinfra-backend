module.exports = {
  apps: [
    {
      name: 'dadosinfra-backend',
      script: 'src/index.js',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
