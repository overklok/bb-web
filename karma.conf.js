// karma.conf.js

var webpackConfig = require('./webpack.config.test.js');

module.exports=function(config) {
config.set({
    // конфигурация репортов о покрытии кода тестами
    coverageReporter: {
      dir:'tmp/coverage/',
      reporters: [
        { type:'html', subdir: 'report-html' },
        { type:'lcov', subdir: 'report-lcov' }
      ],
      instrumenterOptions: {
        istanbul: { noCompact:true }
      }
    },
    // spec файлы, условимся называть по маске **_*.spec.js_**
    files: [
        // 'app/js/**/__tests__/*.spec.js',
        'app/js/**/__tests__/*.spec.ts'
    ],
    frameworks: [ 'chai', 'jasmine' ],
    // репортеры необходимы для  наглядного отображения результатов
    reporters: ['mocha', 'coverage'],
    preprocessors: {
        // 'app/js/**/__tests__/*.spec.js': ['webpack', 'sourcemap', 'coverage'],
        'app/js/**/__tests__/*.spec.ts': ['webpack',  'sourcemap', 'coverage', 'typescript'],
    },
    plugins: [
        'karma-jasmine', 'karma-mocha',
        'karma-chai', 'karma-coverage',
        'karma-webpack', 'karma-phantomjs-launcher',
        'karma-mocha-reporter', 'karma-sourcemap-loader',
        'karma-junit-reporter', 'karma-chrome-launcher', 'karma-firefox-launcher',
        'karma-opera-launcher', 'karma-ie-launcher',

        'karma-typescript-preprocessor',

        'chai-spies'
    ],
    // передаем конфигурацию webpack
    webpack: webpackConfig,
    webpackMiddleware: {
        noInfo: true
    }
  });
};