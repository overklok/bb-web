// karma.conf.js

var webpackConfig = require('./webpack.config.test.js');

module.exports=function(config) {
config.set({
    // logLevel: config.LOG_DEBUG,

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
        'app/js/**/__tests__/*.spec.ts',
    ],
    frameworks: ['chai', 'jasmine', 'karma-typescript'],
    // репортеры необходимы для  наглядного отображения результатов
    reporters: ['mocha', 'coverage', 'karma-typescript'],
    preprocessors: {
        // 'app/js/**/__tests__/*.spec.js': ['webpack', 'sourcemap', 'coverage'],
        'app/js/**/__tests__/*.spec.ts': ['karma-typescript', 'webpack', 'sourcemap', 'coverage'],
    },
    plugins: [
        'karma-jasmine', 'karma-mocha',
        'karma-chai', 'karma-coverage',
        'karma-webpack', 'karma-phantomjs-launcher',
        'karma-mocha-reporter', 'karma-sourcemap-loader',
        'karma-junit-reporter', 'karma-chrome-launcher', 'karma-firefox-launcher',
        'karma-opera-launcher', 'karma-ie-launcher',

        'karma-typescript',

        'chai-spies'
    ],
    karmaTypescriptConfig: {
        tsconfig: "tsconfig.json",
    },
    // передаем конфигурацию webpack
    webpack: webpackConfig,
    webpackMiddleware: {
        noInfo: true
    }
  });
};