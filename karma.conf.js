// Karma configuration
// Generated on Fri Feb 05 2016 07:57:22 GMT+0300 (MSK)

module.exports = function(config) {
  config.set({

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      'http://code.jquery.com/jquery-1.11.3.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular.js',
      // For ngMockE2E
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-mocks.js',
      './client/js/bundle.js',
      './tests/client/tests.js',
      { pattern: '/client/templates/*.html', included: false, served: true }
    ],

    // web server port
    port: 9876,

    proxies : {
      '/': 'http://localhost:9876/base/'
    },
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome']
  });
};
