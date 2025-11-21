module.exports = {
  apps: [
    {
      name: 'shootingwala-in',
      script: 'node',
      args: 'node_modules/next/dist/bin/next start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};