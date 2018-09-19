//获取应用实例
const app = getApp();

Page({
  data: {
    "openMessage": wx.getStorageSync("openMessage"),
    "avatarUrl": "../../images/avatar.png",
    "nickName": wx.getStorageSync('userName'),
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    deviceArr: [{
        "url": "",
        "num": "0",
        "text": "设备"
      },
      {
        "url": "",
        "num": "0",
        "text": "在线"
      },
      {
        "url": "",
        "num": "0",
        "text": "离线"
      },
      {
        "url": "",
        "num": "0",
        "text": "未激活"
      },
    ],
  },
  onLoad: function() {
    var _this = this;
    _this.initDevices();
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              _this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                nickName: wx.getStorageSync('userName')
              });
            }
          })
        }
      }
    })
  },
  loginOut: function() {
    wx.showModal({
      title: '退出登陆',
      content: '确认要退出登陆吗？',
      success: function(res) {
        wx.showLoading({
          title: '退出中',
        });
        if (res.confirm) {
          wx.request({
            url: 'https://ztn-tech.com/ThirdPartyUser/wxAppDelectUserOpenId.htm',
            method: 'POST',
            data: {
              "openid": wx.getStorageSync('openid')
            },
            success: function(ret) {
              wx.hideLoading();
              wx.showToast({
                title: '退出成功',
                icon: 'succes',
                duration: 1000,
                mask: true
              });
              setTimeout(function() {
                wx.redirectTo({
                  url: '../login/index',
                })
              }, 1000);
            },
            fail: function(err) {
              wx.hideLoading();
              wx.showToast({
                title: '网络异常',
                icon: 'none',
                duration: 2000,
                mask: true
              });
            }
          })
        }
      }
    })
  },
  initDevices: function() {
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/DeviceBelong/wxGetControlDevice.htm',
      method: 'POST',
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
        "productId": 0,
        "pageSize": 9999,
        "currentPage": 1,
        "cityId": 0
      },
      success: function(ret) {
        switch (ret.data.flag) {
          case "00":
            _this.initList(ret.data.devices.data);
            break;
          default:
            break;
        }
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000,
          mask: true
        });
      }
    })
  },
  initList: function(options) {
    var _this = this;
    var core = [];
    for (var i in options) {
      core.push(options[i].deviceCore)
    }
    wx.request({
      url: 'https://ztn-tech.com/device/batchGetDeviceStatus.htm',
      method: 'POST',
      data: {
        "productKey": options[0].serverMessage,
        "deviceCores": core,
        "apiKey": wx.getStorageSync('userKey')
      },
      success: function(ret) {
        var devceList = ret.data.data.DeviceStatusList.DeviceStatus;
        for (var i in devceList) {
          for (var j in options) {
            if (devceList[i].DeviceName == options[j].deviceCore) {
              switch (devceList[i].Status) {
                case "ONLINE":
                  options[j].deviceStatus = "在线";
                  break;
                case "OFFLINE":
                  options[j].deviceStatus = "离线";
                  break;
                case "UNACTIVE":
                  options[j].deviceStatus = "未激活";
                  break;
              }
              break;
            }
          }
        }
        var deviceNum = _this.data.deviceArr;
        for (var i in options) {
          deviceNum[0].num = Number(deviceNum[0].num) + 1;
          switch (options[i].deviceStatus) {
            case "在线":
              deviceNum[1].num = Number(deviceNum[1].num) + 1;
              break;
            case "离线":
              deviceNum[2].num = Number(deviceNum[2].num) + 1;
              break;
            case "未激活":
              deviceNum[3].num = Number(deviceNum[3].num) + 1;
              break;
          }
        }
        console.log(deviceNum);
        _this.setData({
          "deviceArr": deviceNum
        })
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000,
          mask: true
        });
      }
    });
    wx.hideLoading();
  },
  errorList: function() {
    wx.navigateTo({
      url: '../errorList/error',
    })
  },
  aboutUs: function() {
    wx.showModal({
      title: '关于我们',
      content: '中山市中泰能科技有限公司是一家以互联网+智能硬件技术创新为核心的企业。公司成立以来，始终致力于农业物联网规模化应用，农业智能硬件研发与配合农业大数据分析公司提供重要农产品数据，为科学种植、食品安全溯源、农业品牌打造提供技术及数据服务',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  openMessage: function(e) {
    this.setData({
      "openMessage": e.detail.value
    })
    wx.setStorageSync('openMessage', e.detail.value)
  }
})