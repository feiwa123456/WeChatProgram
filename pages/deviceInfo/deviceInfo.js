// pages/deviceInfo/index.js
var util = require("../../utils/util.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapHeight: "30vh",
    scale: "16", //缩放级别
    markers: [], //坐标标点
    productId: null,
    productList: [],
    productSeriesList: [],
    seriesId: null,
    lat: null,
    lng: null,
    searchService: null,
    markers: [],
    isIconOpen: false,
    mapSearchStyle: {
      color: 'red'
    },
    mapSearchIndexStyle: {
      display: 'none'
    },
    iconChoseStyle: {
      display: 'none'
    },
    keyword: '',
    dialogAddProductSeriesFormVisible: false,
    form: {
      seriesName: '',
      seriesDesc: ''
    },
    enableSearch: false,
    isShare: 0,
    deviceName: '',
    deviceCore: '',
    remark: '',
    iocUrl: '',
    formLabelWidth: '20%',
    phoneNumber: null,
    serverMessage: null,
    aliDeviceId: null,
    aliDeviceSecret: null,
    createDate: null,
    isSell: null,
    sellTime: null,
    offLineNum: null,
    lastOffLineTimer: null,
    lastOnLineTimer: null,
    communicaType: null,
    focusText: '关注设备',
    thingText: '关闭通讯',
    wxCoreUrl: null,
    dialogWxCoreVisible: false,
    isFocus: 0,
    isThing: 1,
    lockLocText: null,
    lockLocal: 0,
    dataCount: null,
    dialogPhoneFormVisible: false,
    cardFormLabelWidth: '30%',
    adder: null,
    phoneForm: {
      imsi: "460072209800000",
      msisdn: "17220980000",
      iccid: "898602F2191880090000",
      imei: "865371039226666",
      flowTotal: 10240,
      flowUsed: 10610154,
      flowLeft: -10599914,
      voiceTotal: null,
      voiceUsed: null,
      voiceLeft: null,
      smsTotal: null,
      smsUsed: null,
      smsLeft: null,
      activationTime: null,
      overTime: "2019-06-30 23:59:59",
      status: 5,
      currentMonthUsed: 10610154,
    },
    isNet: 1,
    fatherCore: null,
    source: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      deviceCore: options.deviceCore,
      source: options.source
    })
    this.getDeviceInfo();
  },
  deviceLocal: function(option) {
    wx.navigateTo({
      url: '../deviceLocal/deviceLocal?deviceName=' + this.data.deviceName + '&deviceCore=' + this.data.deviceCore,
    })
  },
  deviceOnline: function(option) {
    wx.navigateTo({
      url: '../deviceOnline/deviceOnline?deviceName=' + this.data.deviceName + '&deviceCore=' + this.data.deviceCore,
    })
  },
  getDeviceInfo: function() {
    let that = this;
    wx.showLoading({
      title: '获取中',
    });
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceBelong/queryDeviceByCore.htm',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Cookie': wx.getStorageSync("sessionId")
      },
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
        "deviceCore": that.data.deviceCore,
      },
      success: function(ret) {
        switch (ret.data.flag) {
          case "00":
            let data = ret.data.data;
            let markers = [{
              latitude: data.lat,
              longitude: data.lng,
              width: 25,
              height: 25,
            }];
            switch (data.status) {
              case 'ONLINE':
                data.status = '在线'
                break;
              case 'OFFLINE':
                data.status = '离线'
                break;
              case 'DISABLE':
                data.status = '禁用'
                break;
              case 'UNACTIVE':
                data.status = '未激活'
                break;
              default:
                data.status = '未知'
            }
            console.log(data.buyTime)
            that.setData({
              markers: markers,
              iocUrl: 'https://ztn-tech.com/public/static/wechar-resource/' + data.iocUrl,
              isShare: data.isShare,
              deviceName: data.deviceName,
              status: data.status,
              phoneNumber: data.phoneNumber,
              deviceCore: data.deviceCore,
              productId: data.productId,
              offLineNum: data.offLineNum,
              serverMessage: data.serverMessage,
              communicaType: data.communicaType,
              createDate: data.createDate,
              lastOffLineTimer: util.dateTime(data.lastOnLineTimer * 1000),
              lastOnLineTimer: util.dateTime(data.lastOnLineTimer * 1000), 
              adder: data.adder,
              isNet: data.isNet,
              dataCount: data.dataCount,
              fatherCore: data.fatherCore,
              lockLocal: data.lockLocal,
              lockLocText: data.lockLocal == 1 ? "解锁位置" : "锁定位置",
              isSell: data.isSell == 0 ? '未出售' : '出售',
              sellTime: data.buyTime != 0 ? util.dateTime(data.buyTime * 1000) : '未出售', 
              productId: data.productId,
              remark: data.remark,
              lat: data.lat,
              lng: data.lng,
            })
            break;
          default:
            wx.showToast({
              title: '无法查看该设备',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            setTimeout(function() {
              if (that.data.source == 'nav') {
                wx.navigateBack();
              } else {
                wx.redirectTo({
                  url: '/pages/nav/nav'
                })
              }
            }, 2000);
            break;
        }
        wx.hideLoading();
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
  renewStatus: function () {
    let that = this;
    wx.showLoading({
      title: '获取中',
    });
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceBelong/renewStatus.htm',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Cookie': wx.getStorageSync("sessionId")
      },
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
        "deviceCore": that.data.deviceCore,
      },
      success: function (ret) {
        that.getDeviceInfo();
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
  showPhoneInfo: function() {

  },
  deviceSensor: function() {
    wx.navigateTo({
      url: '../sensors/sensors?deviceName=' + this.data.deviceName + '&deviceCore=' + this.data.deviceCore,
    })
  },
  deviceSetting: function() {
    wx.navigateTo({
      url: '../controller/controller?deviceName=' + this.data.deviceName + '&deviceCore=' + this.data.deviceCore,
    })
  }
})