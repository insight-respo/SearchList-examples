export default {
  routes: [
    {path: '/', redirect: '/example1'},
    {
      path: '/example1',
      component: './example1'
    }
  ],
  plugins: [
    ['umi-plugin-dva', {
      immer: true,
    }]
  ],
  cssLoaderOptions: {
    module: true,
  }
}