const Promise = require('../lib/promise');

let p = new Promise(function (resolve, reject) {
    setTimeout(() => {
        resolve('async data')
    },3000);
}).then(function (value) {
    console.log('success', value);
}, function (reason) {
    console.log('failed', reason);
});