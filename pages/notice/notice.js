//index.js
//获取应用实例
const app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    currentPage: 1,
    pageSize: 50,
    notices: [],
  },
	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function (options) {
    this.getNotice();
  },
  getNotice: function () {
    let that = this;
    wx.showLoading({
      title: '获取中',
    });
    wx.request({
      url: 'https://ztn-tech.com/uni/userNotice/getNoticeListByUserId.htm',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Cookie': wx.getStorageSync("sessionId")
      },
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
        "pageSize": that.data.pageSize,
        "currentPage": that.data.currentPage

      },
      success: function (ret) {
        switch (ret.data.flag) {
          case "00":
            let notices = ret.data.notices.data;
            for (let i = 0; i < notices.length; i++) {
              // notices[i].publicTime = new Date(notices[i].publicTime * 1000).toLocaleString()
              notices[i].publicTime = util.dateTime(notices[i].publicTime * 1000);
            }
            that.setData({
              notices: notices,
            })
            break;
          default:
            wx.showToast({
              title: '暂无数据',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            break;
        }
        wx.hideLoading();
      },
      fail: function (err) {
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
