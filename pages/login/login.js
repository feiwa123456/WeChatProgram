// pages/login/index.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  // options: {
  //   addGlobalClass: false,
  // },
  data: {
    userName: "",
    userPassword: "",
    isBind: true,
    remind: '加载中',
    angle: 0,
    userInfo: {}
  },
  //获取用户输入的用户名
  userNameInput: function(e) {
    this.setData({
      userName: e.detail.value
    })
  },
  //获取用户输入的密码
  passWdInput: function(e) {
    this.setData({
      userPassword: e.detail.value
    })
  },
  onLoad: function(options) {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    }),
    /**
     * 先获取用户openid
     */
    wx.login({
      success: function(ret) {
        wx.request({
          url: 'https://ztn-tech.com/ThirdPartyUser/getWxAppSession.htm',
          method: 'POST',
          data: {
            'code': ret.code
          },
          success: function(res) {
            if (res && res.data.flag == "00") {
              wx.setStorageSync('openid', res.data.session.openid);
              that.userLogin(res.data.session.openid);
            } else {
              wx.hideLoading();
            }
          }
        })
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 1000,
          mask: true
        });
      }
    });
  },
  onShow: function () {
    let that = this
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
          })
        }
      })
    } else {
      that.setData({
        userInfo: userInfo
      })
    }
  },
  onReady: function () {
    var that = this;
    wx.onAccelerometerChange(function (res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (that.data.angle !== angle) {
        that.setData({
          angle: angle
        });
      }
    });
  },
  /**
   * 使用openId登陆
   */
  userLogin: function(openId) {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/ThirdPartyUser/wxAppLogin.htm',
      method: 'POST',
      data: {
        'openid': openId
      },
      success: function(ret) {
        wx.hideLoading();
        switch (ret.data.flag) {
          case "00":
            wx.setStorageSync('userid', ret.data.user_info['userId'])
            wx.setStorageSync('userKey', ret.data.user_info['userKey'])
            wx.setStorageSync('userName', ret.data.user_info['userName'])
            wx.setStorageSync('sessionId', 'PHPSESSID=' + ret.data.sessionId)


            wx.showToast({
              title: '登陆成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });
            setTimeout(function() {
              that.setData({
                remind: ''
              });
              wx.redirectTo({
                url: '../nav/nav',
              })
            }, 1000);
            break;
          case "01":
            wx.showToast({
              title: '登录失败',
              icon: 'none',
              duration: 1000,
              mask: true
            });
            that.setData({
              isBind: true
            })
            break;
          case "02":
            wx.showToast({
              title: '请先绑定用户',
              icon: 'none',
              duration: 1000,
              mask: true
            });
            that.setData({
              remind: '',
              isBind: false
            })
            break;
          case "03":
            wx.showToast({
              title: '你被禁止登陆',
              icon: 'none',
              duration: 1000,
              mask: true
            });
            that.setData({
              remind: '',
              isBind: true
            })
            break;
        }
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 1000,
          mask: true
        });
      }
    })
  },
  /**
   * 绑定用户
   */
  bindUser: function(e) {
    console.log(e)
    let that = this;
    if (this.data.userName == "") {
      wx.showToast({
        title: '请输入账号',
        icon: 'none',
        duration: 1000,
        mask: true
      });
    } else if (this.data.userPassword == "") {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 1000,
        mask: true
      });
    };
    wx.showLoading({
      title: '绑定中',
    });
    wx.request({
      url: 'https://ztn-tech.com/ThirdPartyUser/wxAppBindUser.htm',
      method: 'POST',
      data: {
        'openid': wx.getStorageSync('openid'),
        'userName': this.data.userName,
        'password': this.data.userPassword,
        "nickName": e.detail.userInfo.nickName,
        "headimgurl": e.detail.userInfo.avatarUrl
      },
      success: function(ret) {
        wx.hideLoading();
        if (ret) {
          switch (ret.data.flag) {
            case "00":
              wx.showToast({
                title: '绑定成功',
                icon: 'succes',
                duration: 500,
                mask: true
              });
              that.userLogin(wx.getStorageSync('openid'))
              break;
            case "01":
              wx.showToast({
                title: '密码错误',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
            case "02":
              wx.showToast({
                title: '该用户不存在',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
          }
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
})




