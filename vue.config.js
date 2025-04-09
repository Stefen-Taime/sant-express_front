const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      const env = args[0]['process.env']
      env.VUE_APP_API_URL = JSON.stringify(process.env.VUE_APP_API_URL)
      return args
    })
  }
})