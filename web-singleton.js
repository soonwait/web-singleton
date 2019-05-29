/**
 * Web Singleton v1.0.0
 * https://github.com/soonwait/web-singleton
 *
 * Copyright 2019, soonwait
 * Released under the MIT license
 * 
 * 
 * 有很多这样的场景需求：
 * 1. 打开多个页面都来自同一个网站
 * 2. 他们都包含了同样的站内消息提醒
 * 3. 站内消息在轮询或者建立各种长连接
 * 4. 有新消息到来时，需要更新界面，并声音提示，甚至用浏览器的Notification进行通知
 * 5. 问题是，不能所有的页面都请求数据、播放声音、弹出Notification通知框
 * 6. 这就需要有一种单例的机制：同一时刻，只有一个页面再主要工作，其他页面都静默渲染，只有它关了或者挂了的时候，再有一个页面出来扛旗
 * 
 * web-singleton.js 这个文件就是实现这个功能，当然了还包括一个后台SharedWorker文件 web-singleton-shared-worker.js
 * 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker/SharedWorker
 * 
 * 使用示例一
 * 
 * window.WebSingleton.start(function () {
 *   var data = { value: '这是一个数据样例' };
 *   console.log('只有我在发送数据哦', data);
 *   this.setData(data);
 * }).data(function (data) {
 *   console.log('收到数据了', data);
 * }).init();
 * 
 * 使用示例二
 * 
 * var single =
 *   window.WebSingleton.start(function () {
 *     setInterval(function(){
 *       var data = { time: new Date(), value: '这是一个数据样例' };
 *       console.log('只有我在发送数据哦', data);
 *       single.setData(data);
 *     }, 1000);
 *   }).data(function (data) {
 *     console.log('收到数据了', data);
 *   }).init();
 * 
 * 注意： 为了使页面能得到扛旗通知，init方法必须在start和data调用之后再调用
 * 另外，由于这是一个为了实现单例模式而制作的文件，你就不要奢望多实例使用了，呵呵
 * 
 * 彩蛋：
 * 赠送一个播放声音文件的工具函数
 * single.playSound('https://notificationsounds.com/notification-sounds/unconvinced-569/download/mp3');
 * 
 * 
 * 使用样例三
 * 
 * var started, single =
 *   window.WebSingleton.start(function () {
 *     started = true;
 *     setInterval(function () {
 *       var data = { time: new Date(), value: '这是一个数据样例' };
 *       single.setData(data);
 *     }, 3000);
 *   }).data(function (data) {
 *     console.log('收到数据了', data);
 *     if (started) {
 *       console.log('只有我在播声音哦');
 *       single.playSound('https://notificationsounds.com/notification-sounds/unconvinced-569/download/mp3');
 *     }
 *   }).init();
 * 
 * 
 * 使用样例四
 * 
 * var started, single =
 *   window.WebSingleton.start(function () {
 *     started = true;
 *     setInterval(function () {
 *       var data = { time: new Date(), value: '这是一个数据样例' };
 *       single.setData(data);
 *     }, 10000);
 *   }).data(function (data) {
 *     console.log('收到数据了', data);
 *     if (started) {
 *       // Web Notification API
 *       // 参考 https://www.zhangxinxu.com/wordpress/2016/07/know-html5-web-notification/
 *       if (typeof Notification !== 'undefined') {
 *         Notification.requestPermission().then(function (permission) {
 *           if (permission === 'granted') {
 *             var title = '张鑫旭：';
 *             var options = {
 *               // dir: 'ltr',
 *               // lang: 'zh-cn',
 *               // tag: 'ns message',
 *               // 自定义图标，好使
 *               icon: 'https://image.zhangxinxu.com/image/blog/zxx_240_0818.jpg',
 *               // 叠不叠高楼，chrome不好使
 *               // renotify: false,
 *               // 播不播声音，默认播声音false
 *               // silent: true,
 *               // 自定义声音，chrome也不好使
 *               // sound: 'https://notificationsounds.com/notification-sounds/unconvinced-569/download/mp3',
 *               // 出不出关闭按钮，默认不出，出的话用户必须点才能关气泡
 *               // requireInteraction: true,
 *               body: '你可以这样发一个通知消息' + '\n消息内容：' + data.value
 *             };
 *             var notify = new Notification(title, options);
 *             notify.onclick = function (event) {
 *               // 拦截默认打开新网页
 *               event.preventDefault();
 *               // window.open('http://www.mozilla.org', '_blank');
 *               console.log('通知已经被点了')
 *               notify.close();
 *             };
 *           }
 *         });
 *       }
 *     }
 *   }).init();
 * 
 */

/** WebSingleton_Void */
(function () {
  var __singleton = {
    init: function () {
      return __singleton;
    },
    start: function (cb) {
      return __singleton;
    },
    data: function (cb) {
      return __singleton;
    },
    setData: function (data) {
      return __singleton;
    },
    playSound: function (src) {
      return __singleton;
    }
  };

  window.WebSingleton_Void = __singleton;
}());

/** WebSingleton_LocalStorage */
(function () {
  var __singleton = {
    init: function () {
      throw new Error('还没支持呢');
    },
    start: function (cb) {
      throw new Error('还没支持呢');
    },
    data: function (cb) {
      throw new Error('还没支持呢');
    },
    setData: function (data) {
      throw new Error('还没支持呢');
    },
    playSound: function (src) {
      throw new Error('还没支持呢');
    }
  };

  window.WebSingleton_LocalStorage = __singleton;
}());

/** WebSingleton_SharedWorker */
(function () {
  var __worker, __timer;
  var __startCallback = undefined;
  var __dataCallback = undefined;

  // 这里本来想使用内联我worker吧，节省一个文件的引入
  // 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers
  // 结果好像不能Share
  // var __workerContent = ``;

  var __init = function () {
    if (!__startCallback) throw new Error('必须先调用start(func)');
    if (!__dataCallback) throw new Error('必须先调用data(func)');

    // var blob = new Blob([__workerContent], {type: 'text/javascript'});
    // __worker = new SharedWorker(window.URL.createObjectURL(blob), '--web-singletn-worker--');
    __worker = new SharedWorker('web-singleton-shared-worker.js', '--web-singletn-worker--');
    __worker.port.addEventListener('message', function(e) {
      if (e.data === 'start') {
        // console.log('来自worker的消息：', e.data)
        __startCallback && __startCallback.call(__singleton);
      }
      else if (typeof e.data === 'string') {
        // console.log('来自worker的消息：', e.data)
      }
      else {
        __dataCallback && __dataCallback.call(__singleton, e.data);
      }
    }, false);
    __worker.port.start();
    __timer = setInterval(function() {
      __worker.port.postMessage('heart');
    }, 500);

    window.addEventListener('unload', function (e) {
      __worker.port.postMessage('closing');
      __worker.port.close();
      __timer && clearInterval(__timer);
    }, false);
    return __singleton;
  };

  var __oldSound;
  var __singleton = {
    init: __init,
    start: function (cb) {
      __startCallback = cb;
      return __singleton;
    },
    data: function (cb) {
      __dataCallback = cb;
      return __singleton;
    },
    setData: function (data) {
      __worker.port.postMessage(data);
      return __singleton;
    },
    playSound: function (src) {
      if (__oldSound && __oldSound.src === src) {
        if(__oldSound.readyState >= 2) {
            __oldSound.play();
        } else {
          console.warn('audio not ready');
        }
      } else {
        __oldSound = document.createElement('audio');
        __oldSound.src = src;
        __oldSound.autoplay = true;
        // __oldSound.play();
      }
      return __singleton;
    }
  };

  window.WebSingleton_SharedWorker = __singleton;
}());

/** WebSingleton */
(function () {
  // 使用SharedWorker的时候不需要用Cookie来做心跳
  // var c = "jscookietest=valid";
  // document.cookie = c;
  // if (document.cookie.indexOf(c) === -1) {
  //   console.warn('浏览器不支持 Cookie，程序不能正常运行');
  //   window.WebSingleton = window.WebSingleton_Void;
  // }
  // else
  if (typeof Worker !== 'undefined') {
    window.WebSingleton = window.WebSingleton_SharedWorker;
  } else if (typeof window.localStorage !== 'undefined') {
    window.WebSingleton = window.WebSingleton_LocalStorage;
  } else {
    //alert('当前浏览器不支持webworker');
    console.warn('浏览器既不支持 WebWorker 也不支持 LocalStorage，程序不能正常运行');
    window.WebSingleton = window.WebSingleton_Void;
  }
}());

