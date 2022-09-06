const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  publicPath : process.env.NODE_ENV === 'production'  ? "/todayMeal"  : "/",
  chainWebpack: config => {
    config.plugin("html").tap(args => {
      args[0].title = "今天吃点啥"
      return args;
    })
  }
})
