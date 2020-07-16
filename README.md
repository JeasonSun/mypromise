# 从零开始手写Promise

## 开发记录

### 里程碑1：基础版Promise

#### 目标及特征

1. promise有三个状态：`pending`,`fulfilled`,`rejected`。
2. `new promise`时，参数是一个立即执行的`executor(resolve,reject)`执行器函数。
3. `executor`接受两个参数，`resolve`和`reject`。
4. promise的默认状态是`pending`。
5. promise有一个`value`保存成功状态的值，可以是`undefined/thenable/promise`。
6. promise有一个`reason`保存失败状态的值。
7. promise只能从`pending`到`rejected`，或者从`pending`到`fulfilled`，状态一旦确认，就不会再改变。
8. promise必须有一个`then`方法，then接受两个参数，分别是promise成功的回调`onFulfilled`和失败的回调`onRejected`。
9. promise成功，调用`onFulfilled`，参数是promise的`value`。
10. promise失败，调用`onRejected`，参数是promise的`reason`。
11. 如果then中抛出了异常，那么就会把这个异常作为参数，传递给下一个then的失败的回调`onRejected`。

#### 任务1：完成promise同步处理

* 实现

```javascript
class Promise {
    constructor(executor) {
        this.value = undefined;
        this.reason = undefined;
        this.status = PENDING;

        let resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
            }
        }

        let reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
            }

        }
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(reason);
        }

    }

    then(onFulfilled, onRejected) {
        console.log('current status: ', this.status);
        if (this.status === FULFILLED) {
            onFulfilled(this.value);
        }
        if (this.status === REJECTED) {
            onRejected(this.reason);
        }
    }
}
```

* 测试

```javascript
let p = new Promise(function (resolve, reject) {
    console.log('execute right now');
    resolve('resolve data');
    reject('reject reason')
}).then(function (value) {
    console.log('success', value);
}, function (reason) {
    console.log('failed', reason);
});
```

* 输出

```bash
execute right now
current status:  FULFILLED
success resolve data
```

#### 任务2：完成promise异步处理

* 问题
上述代码，目前只支持同步，如果在`executor`中操作异步，无法得到预期响应。

```javascript
let p = new Promise(function (resolve, reject) {
    setTimeout(() => {
        resolve('async data')
    },1000);
}).then(function (value) {
    console.log('success', value);
}, function (reason) {
    console.log('failed', reason);
});
```

发现输出`current status:  PENDING`，也就是说执行`then`的时候状态还是`PENDING`，由于之前的代码中我们只处理的`FULFILLED`和`REJECTED`，显然不会返回我们想要的结果。我们可以使用发布订阅模式，在调用then的时候，如果当前状态还是`PENDING`，先把成功和失败的回调都先存起来，在`executor`中实际触发`resolve`或`reject`的时候再依次调用成功或失败回调。

* 实现

```diff
class Promise {
    constructor(executor) {
        this.value = undefined;
        this.reason = undefined;
        this.status = PENDING;
+       this.onResolvedCallbacks = [];
+       this.onRejectedCallbacks = [];

        let resolve = (value) => {
            if (this.status === PENDING) {
                this.status = FULFILLED;
                this.value = value;
+               this.onResolvedCallbacks.forEach(fn => fn());
            }
        }

        let reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = reason;
+               this.onRejectedCallbacks.forEach(fn => fn());
            }

        }
        try {
            executor(resolve, reject);
        } catch (error) {
            reject(reason);
        }

    }

    then(onFulfilled, onRejected) {
        console.log('current status: ', this.status);
+        if (this.status === PENDING) {
+            this.onResolvedCallbacks.push(() => {
+                onFulfilled(this.value);
+            });
+            this.onRejectedCallbacks.push(() => {
+                onRejected(this.reason);
+            })
+        }
        if (this.status === FULFILLED) {
            onFulfilled(this.value);
        }
        if (this.status === REJECTED) {
            onRejected(this.reason);
        }
    }
}

```

现在我们再测试一下，1s后输出`success async data`。

### 里程碑2：then的链式调用
