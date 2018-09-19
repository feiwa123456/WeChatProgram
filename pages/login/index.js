// pages/login/index.js
var app =getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userName: "",
    userPassword: "",
    isBind: false
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
    var _this = this;
    wx.showLoading({
      title: '登陆中',
    });
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
              _this.userLogin(res.data.session.openid);
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
  /**
   * 使用openId登陆
   */
  userLogin: function(openId) {
    var _this = this;
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
            if(null == wx.getStorageSync('openMessage')){
              wx.setStorageSync('openMessage', true)
            }
            app.openMessage();
            wx.showToast({
              title: '登陆成功',
              icon: 'succes',
              duration: 1000,
              mask: true
            });
            setTimeout(function() {
              wx.switchTab({
                url: '../index/index',
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
            _this.setData({
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
            _this.setData({
              isBind: true
            })
            break;
            case "03":
            wx.showToast({
              title: '你被禁止登陆',
              icon: 'none',
              duration: 1000,
              mask: true
            });
            _this.setData({
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
    var _this =this;
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
              _this.userLogin(wx.getStorageSync('openid'))
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