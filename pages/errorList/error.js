var app = getApp()

Page({
  data: {
    currentPage:1,
  },
  onLoad: function () {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/userError/wxGetErrorListByUserId.htm',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "pageSize": 100,
        "currentPage": that.data.currentPage

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function (res) {
        console.log(res.data)
        that.setData({
          Errordate: res.data.errors.data,
          allErrorPages: Math.ceil((res.data.errors.total)/100),
        })
        
      }
    })
  },
  onPullDownRefresh:function() {
    var that = this;
    that.data.currentPage=1
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.request({
      url: 'https://ztn-tech.com/userError/wxGetErrorListByUserId.htm',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "pageSize": 100,
        "currentPage": that.data.currentPage
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function (res) {
        console.log(res.data.errors.data)
        that.setData({
          Errordate: res.data.errors.data,
          loadMoreData: ''
        })
      },
      fail: function () {
        console.log(res.data.msg);
      },
      complete: function () {
        wx.hideNavigationBarLoading();                   //完成停止加载
        wx.stopPullDownRefresh();                       //停止下拉刷新
      }
    })     
  },

  onReachBottom: function () {
    var that = this;
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    that.data.currentPage = that.data.currentPage+1
    // 页数+1
    wx.request({
      url: 'https://ztn-tech.com/userError/wxGetErrorListByUserId.htm',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "pageSize": 100,
        "currentPage": that.data.currentPage
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function (res) {
        if (that.data.currentPage>2) {
          that.setData({
            loadMoreData: '已经到底了'
          })
          wx.hideLoading();
          return;
        }else{
        // 回调函数
        var Errordate_list = that.data.Errordate;

        for (var i = 0; i < res.data.errors.data.length; i++) {
          Errordate_list.push(res.data.errors.data[i]);
        }
        // 设置数据
        that.setData({
          Errordate: Errordate_list
        })
        console.log(that.data.Errordate)
        // 隐藏加载框
          wx.hideLoading();
        }
      }
    })
  },

})
