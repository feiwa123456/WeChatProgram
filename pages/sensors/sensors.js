Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceCore: "",
    deviceName: "",
    sensorsList: [],
    cams:[],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let that = this;
    let deviceCore = options.deviceCore
    this.setData({
      deviceCore: options.deviceCore,
    });
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceBelong/queryDevicesInfo.htm',
      method: 'POST',
      data: {
        'userId': wx.getStorageSync('userid'),
        "deviceCore": deviceCore,
        "pageSize": 999,
        "currentPage": 1,
        "apiKey": wx.getStorageSync('userKey')
      },
      success: function(ret) {
        if (ret && ret.data.flag == "00") {
          let data = ret.data.sensorsList.data;
          if (data.length > 0){
            for(let i = 0 ;i<data.length;i++){
              if (data[i].type == 1){
                data[i].type = "传感器"
              } else if (data[i].type == 0) {
                data[i].type = "从设备"
              }
            }
            let deviceName = data[0].deviceName;
            that.setData({
              "sensorsList": data,
              "deviceName": deviceName
            })
            wx.setNavigationBarTitle({ title: deviceName })
          }else{
            wx.showToast({
              title: '没有传感器',
            })
            setTimeout(function () {
                wx.navigateBack();
            }, 1000);
          }
        }
      },
      fail: function(err) {}
    })
    this.getCamList();
  },
  showCharts: function(option) {
    var that = this;
    var sensorId = option.currentTarget.dataset.sensorid;
    if (typeof(sensorId) != "undefined" && sensorId != null) {
      wx.navigateTo({
        url: '../chart/chart?sensorId=' + sensorId + "&deviceCore=" + that.data.deviceCore,
      })
    }
  }, getCamList: function () {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/DeviceCamera/getCameraList',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "deviceCore": that.data.deviceCore,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function (res) {
        var data = res.data.cameraList;
        that.setData({
          cams: data,
        })
      }
    })
  }, camTap: function (option) {
    var that = this;
    let hid = option.currentTarget.dataset.hid
    let dataserver = option.currentTarget.dataset.dataserver
      wx.navigateTo({
        url: '../player/player?hid=' + hid + "&dataserver=" + dataserver,
      })
  },
})