Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceCore:"",
    deviceName:"",
    sensorsList:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    var deviceCore = options.deviceCore
    this.setData({
      deviceCore: options.deviceCore
    });
    wx.request({
      url: 'https://ztn-tech.com/device/wxQueryDevicesInfo.htm',
      method:'POST',
      data:{
        'userId': wx.getStorageSync('userid'),
        "deviceCore": deviceCore,
        "pageSize": 999,
        "currentPage": 1,
        "apiKey": wx.getStorageSync('userKey')
      },
      success:function(ret){
        console.log(ret);
        if(ret && ret.data.flag == "00"){
          _this.setData({
            "sensorsList": ret.data.sensorsList.data,
            "deviceName": ret.data.sensorsList.data[0].deviceName
          })
        }
      },
      fail:function(err){
      }
    })
  },
  showCharts:function(option){
    var _this = this;
    var sensorId = option.currentTarget.dataset.sensorid;
    if (typeof (sensorId) != "undefined" && sensorId != null){
      wx.navigateTo({
        url: '../chart/index?sensorId=' + sensorId,
      })
    }
  }
})