const Promise = require('../lib/promise');

let p = new Promise(function (resolve, reject) {
    console.log('execute right now');
    resolve('resolve data');
    reject('reject reason');
}).then(function (value) {
    console.log('success', value);
}, function (reason) {
    console.log('failed', reason);
});