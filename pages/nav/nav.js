Page({
  data: {
    PageCur: 'home'
  },
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  onPullDownRefresh: function () {
    list_box
    console.log("onPullDownRefresh");
  },
  onReachBottom: function() {
    let deviceListComp = this.selectComponent('#deviceListId');
    if (deviceListComp != null) {
      deviceListComp.onReachBottom();
    }
  },
  onLoad: function() {
    if (true == wx.getStorageSync('openMessage')) {
      this.openMessage();
    }
  },
  openMessage: function() {
    var _this = this;
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
  },
  seeDevice: function() {
    var _this = this;
    wx.scanCode({
      success: function(res) {
        if (res.path) {
          try {
            setTimeout(function() {
              wx.navigateTo({
                url: res.path + '&source=nav'
              });
            }, 1000);
          } catch (e) {
            wx.showToast({
              title: '二维码有误',
              icon: 'success',
              duration: 1000
            });
          }
        } else {
          wx.showToast({
            title: '二维码有误',
            icon: 'success',
            duration: 1000
          });
        }

        // console.log('scan res:', res.result);
        // var req = JSON.parse(res.result)
        // wx.request({
        //   url: 'https://ztn-tech.com/device/wxClientGetDevice.htm',
        //   method: 'POST',
        //   header: {
        //     'content-type': 'application/json',
        //     'Cookie': wx.getStorageSync("sessionId")
        //   },
        //   data: {
        //     "userId": wx.getStorageSync("userid"),
        //     "apiKey": wx.getStorageSync('userKey'),
        //     "deviceCore": req.deviceCore,
        //     "aliDeviceId": req.aliDeviceId,

        //   },
        //   success: function (ret) {
        //     //  console.log(ret);
        //     switch (ret.data.flag) {
        //       case "00":
        //         wx.showToast({
        //           title: '添加设备成功',
        //           icon: 'none',
        //           duration: 2000,
        //           mask: true
        //         });
        //         _this.getProvinceDevice();
        //         _this.getTypeList();
        //         break;
        //         case "01":
        //         wx.showToast({
        //           title: '该设备不存在',
        //           icon: 'none',
        //           duration: 2000,
        //           mask: true
        //         });
        //         break
        //       default:
        //         wx.showToast({
        //           title: '添加设备失败',
        //           icon: 'none',
        //           duration: 2000,
        //           mask: true
        //         });
        //         break;
        //     }
        //   },
        //   fail: function (err) {
        //     wx.hideLoading();
        //     wx.showToast({
        //       title: '网络异常',
        //       icon: 'none',
        //       duration: 2000,
        //       mask: true
        //     });
        //   }
        // })
      },
      fail: function(res) {
        console.log('scan fail:', res);
      }
    })
  },
})