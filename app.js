//app.js

App({
  onLaunch: function() {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  openMessage: function() {
    var _this =this;
    wx.connectSocket({
      url: 'wss://ztn-tech.com/wss',
    })
    wx.onSocketOpen(function(res) {
      console.log('WebSocket连接已打开！');
      var mCmd = {
        "cmd": "bindUser",
        "parameters": wx.getStorageSync("userid")
      }
      wx.sendSocketMessage({
        data: JSON.stringify(mCmd),
        success: function(ret) {
          console.log('WebSocket监听成功！');
        },
        fail: function(err) {
          console.log('WebSocket监听失败！');
        }
      })
    })
    wx.onSocketError(function(res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
    wx.onSocketMessage(function(res) {

      var nowData = JSON.parse(res.data)
      console.log('收到：' + nowData.val)
      if (wx.getStorageSync('openMessage')) {
        wx.showToast({
          title: nowData.val,
          icon: 'none',
          duration: 700
        })
      }
    })
    wx.onSocketClose(function(res) {
      console.log('WebSocket 已关闭！')
    })
  }
})