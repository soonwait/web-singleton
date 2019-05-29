## 项目由来

有这样的场景需求：
1. 打开多个页面都来自同一个网站
2. 他们都包含了同样的站内消息提醒
3. 站内消息在轮询或者建立各种长连接
4. 有新消息到来时，需要更新页面局部，并播放提示声音，甚至用浏览器的 `Notification API` 进行通知
5. 问题是，不能所有的页面都在同时请求数据、播放声音、弹出 `Notification` 通知框
6. 这就需要有一种单例的机制：同一时刻，只有一个页面在主要工作，其他页面都静默渲染
7. 只有这个页面被关了或者挂了的时候，再有一个页面出来扛旗

web-singleton.js 这个文件就是实现这个功能，当然了还包括一个后台SharedWorker文件 web-singleton-shared-worker.js

参考 https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker/SharedWorker

## 使用方法

1. 两个`js`文件要放在相同网络位置
2. `html`只需要引入一个文件 `web-singleton.js`，另一个`js`是在它里面引用的。
3. 如果用了 `requireJS`，也只需要`require`其中一个文件 `web-singleton.js`
4. 使用方法见js里的帮助，例子这里也贴出来

## 使用示例一

```js
window.WebSingleton.start(function () {
  var data = { value: '这是一个数据样例' };
  console.log('只有我在发送数据哦', data);
  this.setData(data);
}).data(function (data) {
  console.log('收到数据了', data);
}).init();
```

## 使用示例二

```js
var single =
  window.WebSingleton.start(function () {
    setInterval(function(){
      var data = { time: new Date(), value: '这是一个数据样例' };
      console.log('只有我在发送数据哦', data);
      single.setData(data);
    }, 1000);
  }).data(function (data) {
    console.log('收到数据了', data);
  }).init();
```

注意： 为了使页面能得到扛旗通知，init方法必须在start和data调用之后再调用
另外，由于这是一个为了实现单例模式而制作的文件，你就不要奢望多实例使用了，呵呵

彩蛋：
赠送一个播放声音文件的工具函数
single.playSound('https://notificationsounds.com/notification-sounds/unconvinced-569/download/mp3');


## 使用样例三

```js
var started, single =
  window.WebSingleton.start(function () {
    started = true;
    setInterval(function () {
      var data = { time: new Date(), value: '这是一个数据样例' };
      single.setData(data);
    }, 3000);
  }).data(function (data) {
    console.log('收到数据了', data);
    if (started) {
      console.log('只有我在播声音哦');
      single.playSound('https://notificationsounds.com/notification-sounds/unconvinced-569/download/mp3');
    }
  }).init();
```

## 使用样例四

```js
var started, single =
  window.WebSingleton.start(function () {
    started = true;
    setInterval(function () {
      var data = { time: new Date(), value: '这是一个数据样例' };
      single.setData(data);
    }, 10000);
  }).data(function (data) {
    console.log('收到数据了', data);
    if (started) {
      // Web Notification API
      // 参考 https://www.zhangxinxu.com/wordpress/2016/07/know-html5-web-notification/
      if (typeof Notification !== 'undefined') {
        Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
            var title = '张鑫旭：';
            var options = {
              // dir: 'ltr',
              // lang: 'zh-cn',
              // tag: 'ns message',
              // 自定义图标，好使
              icon: 'https://image.zhangxinxu.com/image/blog/zxx_240_0818.jpg',
              // 叠不叠高楼，chrome不好使
              // renotify: false,
              // 播不播声音，默认播声音false
              // silent: true,
              // 自定义声音，chrome也不好使
              // sound: 'https://notificationsounds.com/notification-sounds/unconvinced-569/download/mp3',
              // 出不出关闭按钮，默认不出，出的话用户必须点才能关气泡
              // requireInteraction: true,
              body: '你可以这样发一个通知消息' + '\n消息内容：' + data.value
            };
            var notify = new Notification(title, options);
            notify.onclick = function (event) {
              // 拦截默认打开新网页
              event.preventDefault();
              // window.open('http://www.mozilla.org', '_blank');
              console.log('通知已经被点了')
              notify.close();
            };
          }
        });
      }
    }
  }).init();
```
