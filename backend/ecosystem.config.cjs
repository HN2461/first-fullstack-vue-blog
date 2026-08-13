module.exports = {
  apps: [
    {
      name: 'personal-blog-api',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
