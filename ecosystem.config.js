module.exports = {
  apps: [
    {
      args: 'start', // 直接指定端口号
      env: {
        NODE_ENV: 'production',
        PORT: 3210, // 设置你的端口号
      },
      name: 'lobe-chat',
      script: 'npm',
    },
  ],
};
