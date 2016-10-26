/**
 * Created by py on 27/08/16.
 */

exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['./spec/pfin_specs/e2eSpec.js']
};