// sharedWorker所要用到的js文件，不必打包到项目中，直接放到服务器即可
let __ports = [];
let __hearts = {};
let __checkTimer = null;

let __data = null;

self.addEventListener('connect', function (e) {

  let port = e.ports[0];
  if (!__ports.includes(port)) __ports.push(port);
  __tryStartChecker();

  __broadcast(`第${__ports.length}把椅子有人坐了，呱唧呱唧。。。`);
  port.postMessage(`悄悄告诉你，你坐的就是第${__ports.length}把椅子，嘿`);
  __zifeng(port);

  port.onmessage = function (e) {
    // 那人还在呢
    if (e.data === 'heart') {
      __hearts[port] = new Date().getTime();
    }
    // 那人走了
    else if (e.data === 'closing') {
      __quit(port);
      port.close();
      port = undefined;
    }
    // 镜子镜子，给我命令
    else if (e.data === 'get') {
      port.postMessage(__data);
    }
    // 王来发布命令了
    else if (port === __king) {
      __data = e.data;
      __broadcast(__data);
    }
    else {
      port.postMessage('当前其他页面正在处理数据，你不被允许发送数据呢，你可以get')
    }
  }
}, false);
// 巡视，看看山寨里有没有人已经死了，就把它从椅子上除名
function __tryStartChecker() {
  if (!__checkTimer) {
    __broadcast(`终于有人来了`);
    __checkTimer = setInterval(function checkExpired() {
      __ports.filter(port => !!port).forEach(port => {
        var time = __hearts[port], now = new Date().getTime();
        if (now - time >= 3000) {
          __expired(port);
        }
      });
      if (__ports.filter(port => !!port).length <= 0) {
        clearInterval(__checkTimer);
        __checkTimer = null;
      }
    }, 3000);
  }
}

// 山寨里只能有一个王
let __king = undefined;
// 自立为王，每个人来到山寨的时候都可以自立为王，只要前面没有王，它就是王
function __zifeng(port) {
  if (!__king) {
    __king = port;
    port.postMessage(`恭喜你，你已经自立为王了`);
    port.postMessage(`start`);
  }
}
// 王走了或者死了以后，其他人可以继承王
function __jicheng() {
  var port = __ports.find(port => !!port);
  if (typeof port !== 'undefined') {
    __king = port;
    port.postMessage("恭喜你，你继承了王位");
    port.postMessage(`start`);
  }
}
// 王走了
function __quit(port) {
  var idx = __ports.indexOf(port);
  __hearts[port] = undefined;
  __ports[idx] = undefined;
  __broadcast(`第${idx + 1}把椅子上的人走了`);
  if (port === __king) {
    __king = undefined;
    __jicheng();
  }
}
// 王死了
function __expired(port) {
  var idx = __ports.indexOf(port);
  __hearts[port] = undefined;
  __ports[idx] = undefined;
  __broadcast(`第${idx + 1}把椅子上的人可能死了`);
  if (port === __king) {
    __king = undefined;
    __jicheng();
  }
}
// 发号施令，广播消息或数据
function __broadcast(msg) {
  __ports.filter(port => !!port).forEach(port => {
    port.postMessage(msg);
  });
}
