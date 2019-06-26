var app = getApp()
var util = require("../../utils/util.js")

Page({
  data: {
    currentPage: 1,
    pageSize: 10,
    errorDate: [],
    hasMoreData: true,
    imageshow:true,
  },
  onLoad: function() {
    this.getErrorList("");
  },
  getErrorList: function(message) {
    var that = this;
    wx.showLoading({
      title: message,
    })
    wx.request({
      url: 'https://ztn-tech.com/uni/userError/getErrorListByUserId.htm',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "pageSize": that.data.pageSize,
        "currentPage": that.data.currentPage,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function(res) {
        console.log(res.data);
        console.log(that.data.errorDate);
        var errorDateList = that.data.errorDate;
        switch (res.data.flag) {
          case "00":
            if (that.data.currentPage == 1) {
              errorDateList = [];
            }
            var errorDate = res.data.errors.data;
            console.log(errorDateList);
            let wxTimeStamp
            for (var i = 0; i < errorDate.length; i++) {
              wxTimeStamp = util.dateTime(errorDate[i].updateTime * 1000);
              errorDate[i].updateTime = wxTimeStamp
              if (errorDate[i].solve == 0) {
                errorDate[i].solve = '未处理'
              } else if (errorDate[i].solve == 1) {
                errorDate[i].solve = "误报"
              } else if (errorDate[i].solve == 2) {
                errorDate[i].solve = "已处理"
              }
            }
            var option = errorDateList.concat(errorDate);
            
            if (that.data.currentPage >= res.data.errors.last_page) {
              that.setData({
                errorDate: option,
                hasMoreData: false
              })
            } else {
              that.setData({
                errorDate: option,
                hasMoreData: true,
                currentPage: that.data.currentPage + 1
              })

            }
            console.log(option)
            console.log(that.data.errorDate)
            break;
          default:
            wx.hideLoading();
            if (ret.data.devices.total == 0) {
              wx.showToast({
                title: '暂无数据',
                icon: 'none',
                duration: 2000,
                mask: true
              });

            }
            break;
        }
      },
       fail: function (err) {
        wx.hideLoading();
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000,
          mask: true
        });
      },
      complete: function () {
        wx.hideLoading();
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log('下拉');
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.data.pageNum = 1
    this.getErrorList('正在刷新数据')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hasMoreData) {
      this.getErrorList('加载更多错误数据')
    } else {
      wx.showToast({
        title: '没有更多错误数据',
      })
    }
  }
})