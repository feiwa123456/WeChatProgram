var cityVision = false;
var productId = 0;
var markerId = 0;

Page({
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap')
  },
  onLoad:function(e){
    this.getProvinceDevice();
    this.getTypeList();
  },
  data: {
    showView: false,
    "mapHeight":"100vh",
    "device_img": "../../images/device_off.png",
    "longitude": "113.324520",      //中心经度
    "latitude": "23.099994",        //中心纬度
    "scale":"5",                    //缩放级别
    "markers": [],                  //坐标标点
    "device_list":[],               //设备列表
    "polyline":[],                  //路线坐标
    "deviceType": "全部产品",
    "typeList": ['全部产品'],
    "typeData": [],
    "nowVal":0
  },
  showList: function () {
    var _this = this;
    _this.setData({
      showView: true,
      "mapHeight": "92vh"
    })
  },
  hideList: function () {
    var _this = this;
    _this.setData({
      showView: false,
      "mapHeight": "100vh"
    })
  },
  /**
   * 捕捉地图改变
   */
  onMapChange:function(e){
    if (e.type == "begin"){
      return false;
    }
    var _this = this;
    this.mapCtx.getScale({
      success:function(ret){
        if (ret.scale <= 7 && cityVision){
          _this.getProvinceDevice();
        } else if (ret.scale > 7 && !cityVision){
          _this.getCityDevice();
        }
      }
    })
  },
  /**
   * 点击标注事件
   */
  markertap(e) {
    productId = 0;
    this.setData({
      "deviceType": "全部产品",
      "nowVal":0
    })
    markerId = e.markerId;
    this.getDevieListByProvice(e.markerId);
  },
  /**
   * 按省级获取设备数量
   */
  getProvinceDevice:function(){
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/DeviceBelong/provinceUserDeviceNum.htm',
      method: 'POST',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
      },
      success: function (ret) {
        cityVision = false;
        switch (ret.data.flag) {
          case "00":
            _this.changeMarker(ret.data.deviceNum);
            break;
          case "01":
            //没有设备
            break;
        }
      },
      fail: function (err) {
      }
    })
  },
  /**
   * 按城市获取设备数量
   */
  getCityDevice:function(id){
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/DeviceBelong/cityUserDeviceNum',
      method: 'POST',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        // "provinceId": id
      },
      success: function (ret) {
        cityVision = true;
        switch (ret.data.flag) {
          case "00":
            _this.changeMarker(ret.data.deviceNum);
            break;
          case "01":
            //没有设备
            break;
        }
      },
      fail: function (err) {
      }
    })
  },
  /**
   * 获取设备列表
   */
  getDevieListByProvice:function(id){
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/DeviceBelong/cityUserDevices',
      method: 'POST',
      data: {
        "userId": wx.getStorageSync('userid'),
        "cityId": id,
        "productId": productId,
        "currentPage": 1,
        "pageSize": 9999,
        "apiKey": wx.getStorageSync('userKey')
      },
      success: function (ret) {
        console.log(ret);
        switch (ret.data.flag) {
          case "00":
            _this.initDeviceList(ret.data.devices.data);
            break;
          case "01":
            //没有设备
            break;
        }
      },
      fail: function (err) {
      }
    })
  },
  /**
   * 更换标注
   */
  changeMarker:function(options){
    var markerArr = [];
    for (var i in options){
      var item = {};
      item.id = Number(options[i].provinceId ? options[i].provinceId : options[i].cityId);
      item.width = 25;
      item.height = 25;
      item.latitude = Number(options[i].lat);
      item.longitude = Number(options[i].lng);
      if (options[i].num >= 99){
        item.iconPath = "../../nums/local_99.png";
      }else{
        item.iconPath = "../../nums/local_" + options[i].num+".png";
      }
      markerArr.push(item);
    }
    this.setData({
      markers: markerArr
    })
  },
  /**
   * 渲染设备列表
   */
  initDeviceList:function(options){
    var _this = this;
    if (options.length == 0) {
      _this.setData({
        "device_list": []
      })
      return false;
    }
    var core = [];
    var list = [];
    for(var i in options){
      var item = {};
      item.deviceName = options[i].deviceName;
      item.deviceId = options[i].aliDeviceId;
      item.deviceCore = options[i].deviceCore;
      item.deviceAddr = options[i].adder;
      item.deviceLat = options[i].lat;
      item.deviceLng = options[i].lng;
      item.productId = options[i].productId;
      item.deviceIcon = 'https://ztn-tech.com/public/static/wechar-resource/' + options[i].iocUrl
      item.serverMessage = options[i].serverMessage;
      core.push(options[i].deviceCore)
      list.push(item);      
    }
    wx.request({
      url: 'https://ztn-tech.com/device/batchGetDeviceStatus.htm',
      method: 'POST',
      data:{
        "productKey": options[0].serverMessage,
        "deviceCores": core,
        "apiKey": wx.getStorageSync('userKey')
      },
      success:function(ret){
        var devceList = ret.data.data.DeviceStatusList.DeviceStatus;
        for (var i in devceList){
          for (var j in list){
            if (devceList[i].DeviceName == list[j].deviceCore){
              switch (devceList[i].Status){
                case "ONLINE":
                  list[j].deviceState = "在线";
                  break;
                case "OFFLINE":
                  list[j].deviceState = "离线";
                  break;
                case "UNACTIVE":
                  list[j].deviceState = "未激活";
                  break;
              }
              break;
            }
          }
        }
        _this.setData({
          "device_list": list,
        });
        _this.showList();
      }
    })
  },
  /**
   * 导航
   */
  navigation:function(e){
    wx.getLocation({//获取当前经纬度
      type: 'wgs84', 
      success: function (res) {
        wx.openLocation({//​使用微信内置地图查看位置。
          latitude: e.currentTarget.dataset.lat,
          longitude: e.currentTarget.dataset.lng,
          name: e.currentTarget.dataset.name,
          address: e.currentTarget.dataset.addr
        })
      }
    })
  },
  /**
   * 跳转传感器页
   */
  deviceSensor:function(option){
    wx.navigateTo({
      url: '../sensors/index?deviceCore=' + option.currentTarget.dataset.devicecore,
    })
  },
  /**
   * 跳转到控制界面
   */
  deviceController:function(option){
    var deviceName = option.currentTarget.dataset.name;
    var deviceCore = option.currentTarget.dataset.devicecore;
    var serverMessage = option.currentTarget.dataset.servermessage;
    var deviceId = option.currentTarget.dataset.deviceid;
    wx.navigateTo({
      url: '../controller/index?deviceName=' + deviceName + '&deviceCore=' + deviceCore + "&serverMessage=" + serverMessage + "&deviceId=" + deviceId,
    })
  },
  /**
   * 获取类型列表
   */
  getTypeList: function () {
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/product/wxGetUserAllProduct.htm',
      method: 'POST',
      data: {
        "userId": wx.getStorageSync("userid"),
        "apiKey": wx.getStorageSync('userKey'),
      },
      success: function (ret) {
        if (ret && ret.data.flag == "00") {
          var data = ret.data.productList;
          var list = ['全部产品'];
          var listData = [
            { "id": "0", "name": "全部产品" }
          ];
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
      fail: function (err) {
      }
    })
  },
  /**
   * 类型改变
   */
  typeChange: function (e) {
    var _this = this;
    productId = _this.data.typeData[e.detail.value].id;
    this.getDevieListByProvice(markerId);
    _this.setData({
      "deviceType": _this.data.typeData[e.detail.value].name
    });
  }
})