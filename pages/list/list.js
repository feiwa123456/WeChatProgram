var productId = 0;
var area;
var cityId = 0;

Page({
  onLoad: function(option) {
    this.getDeviceList();
    this.getTypeList();
  },
  onPullDownRefresh: function() {
    this.getDeviceList();
    this.getTypeList();
  },
  data: {
    "device_img": "../../images/device_off.png",
    "deviceList": [],
    "deviceType": "全部产品",
    "typeList": ['全部产品'],
    "areaText": "地域筛选",
    "typeData": [],
    "multiArray": [],
    "multiIndex": [0, 0],
  },
  initList: function(options) {
    var _this = this;
    if (options.length == 0) {
      wx.hideLoading();
      _this.setData({
        "deviceList": []
      })
      return false;
    }
    var core = [];
    var list = [];
    for (var i in options) {
      var item = {};
      item.deviceName = options[i].deviceName;
      item.deviceId = options[i].aliDeviceId;
      item.deviceCore = options[i].deviceCore;
      item.deviceAddr = options[i].adder;
      item.deviceLat = options[i].lat;
      item.deviceLng = options[i].lng;
      item.productId = options[i].productId;
      item.serverMessage = options[i].serverMessage;
      item.deviceIcon = 'https://ztn-tech.com/public/static/wechar-resource/' + options[i].iocUrl
      core.push(options[i].deviceCore)
      list.push(item);
    }
    wx.request({
      url: 'https://ztn-tech.com/device/batchGetDeviceStatus.htm',
      method: 'POST',
      data: {
        "productKey": options[0].serverMessage,
        "deviceCores": core
      },
      success: function(ret) {
        var devceList = ret.data.data.DeviceStatusList.DeviceStatus;
        for (var i in devceList) {
          for (var j in list) {
            if (devceList[i].DeviceName == list[j].deviceCore) {
              switch (devceList[i].Status) {
                case "ONLINE":
                  list[j].deviceStatus = "在线";
                  break;
                case "OFFLINE":
                  list[j].deviceStatus = "离线";
                  break;
                case "UNACTIVE":
                  list[j].deviceStatus = "未激活";
                  break;
                default:
                  list[j].deviceStatus = "未激活";
                  break;
              }
          
              break;
            }
          }
        }
        _this.setData({
          "deviceList": list
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
    _this.setData({
      "deviceList": list
    });
    wx.hideLoading();
  },
  /**
   * 跳转到控制界面
   */
  deviceController: function(option) {
    var deviceName = option.currentTarget.dataset.name;
    var deviceCore = option.currentTarget.dataset.devicecore;
    var serverMessage = option.currentTarget.dataset.servermessage;
    var deviceid = option.currentTarget.dataset.deviceid;
    console.log("---------" + '../controller/index?deviceName=' + deviceName + '&deviceCore=' + deviceCore + "&serverMessage=" + serverMessage + "&deviceId=" + deviceid)
    wx.navigateTo({
      url: '../controller/index?deviceName=' + deviceName + '&deviceCore=' + deviceCore + "&serverMessage=" + serverMessage + "&deviceId=" + deviceid,
    })
  },
  /**
   * 跳转传感器页面
   */
  deviceSensor: function(option) {
    console.log("--------" + option.currentTarget.dataset.devicecore);
    wx.navigateTo({
      url: '../sensors/index?deviceCore=' + option.currentTarget.dataset.devicecore,
    })
  },
  /**
   * 获取设备列表
   */
  getDeviceList: function() {
   
    var _this = this;
    wx.showLoading({
      title: '获取列表中',
    });
    wx.request({
      url: 'https://ztn-tech.com/DeviceBelong/wxGetControlDevice.htm',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Cookie': wx.getStorageSync("sessionId")
      },
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
        "productId": productId,
        "pageSize": 9999,
        "currentPage": 1,
        "cityId": cityId
      },
      success: function(ret) {
      //  console.log(ret);
        switch (ret.data.flag) {
          case "00":
            _this.initList(ret.data.devices.data);
            if (area == null) {
              _this.initArea(ret.data.devices.data);
            }
            break;
          default:
            wx.hideLoading();
            wx.showToast({
              title: '暂无数据',
              icon: 'none',
              duration: 2000,
              mask: true
            });
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
  /**
   * 处理地区列表
   */
  initArea: function(options) {
    var _this = this;
    var list = [{
      "id": 0,
      "name": "全部",
      "cityList": [{
        "id": 0,
        "name": "全部"
      }]
    }];
    var province = [];
    var city = [];
    for (var i in options) {
      if (province.indexOf(options[i].province) == -1) {
        province.push(options[i].province);
        list.push({
          "id": options[i].provinceId,
          "name": options[i].province
        })
      } else {
        continue;
      }
      for (var j in options) {
        if (options[j].province == options[i].province) {
          if (list[list.length - 1].cityList == null || typeof(list[list.length - 1].cityList) == "undefined") {
            list[list.length - 1].cityList = [];
          }
          if (city.indexOf(options[j].city) == -1) {
            city.push(options[j].city);
            list[list.length - 1].cityList.push({
              "id": options[j].cityId,
              "name": options[j].city
            })
          }
        }
      }
    }
    area = list;

    var nowList = [];
    var obj = [];
    for (var i in list) {
      obj.push(list[i].name);
    }
    nowList.push(obj);
    obj = ['全部'];
    nowList.push(obj);
    _this.setData({
      "multiArray": nowList
    })
  },
  /**
   * 获取类型列表
   */
  getTypeList: function() {
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/product/wxGetAllProduct.htm',
      method: 'POST',
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
      },
      success: function(ret) {
        if (ret && ret.data.flag == "00") {
          var data = ret.data.productList;
          var list = ['全部产品'];
          var listData = [{
            "id": "0",
            "name": "全部产品"
          }];
          for (var i in data) {
            var obj = {
              "id": data[i].productId,
              "name": data[i].productName
            }
            list.push(data[i].productName);
            listData.push(obj);
          }
          _this.setData({
            'typeList': list,
            "typeData": listData
          });
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
  /**
   * 类型改变
   */
  typeChange: function(e) {
    var _this = this;
    productId = _this.data.typeData[e.detail.value].id;
    this.getDeviceList();
    _this.setData({
      "deviceType": _this.data.typeData[e.detail.value].name
    })
  },
  MultiPickerChange: function(e) {
    cityId = area[e.detail.value[0]].cityList[e.detail.value[1]].id;
    var name = area[e.detail.value[0]].cityList[e.detail.value[1]].name;
    if (name == "全部") {
      name = "地域选择"
    }
    this.setData({
      "areaText": name
    })
    this.getDeviceList();
  },
  MultiPickerColumnChange: function(e) {
    if (e.detail.column == 0) {
      var data = {
        multiArray: this.data.multiArray,
        multiIndex: this.data.multiIndex
      };
      data.multiIndex[e.detail.column] = e.detail.value;
      var cityData = area[e.detail.value].cityList;
      var dataArr = [];
      for (var i in cityData) {
        dataArr.push(cityData[i].name);
      }
      data.multiArray[1] = dataArr;
      data.multiIndex[1] = 0;
      this.setData(data);
    }
  }
})