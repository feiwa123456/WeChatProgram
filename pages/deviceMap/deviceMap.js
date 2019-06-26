let cityVision = false;
let productId = 0;


Component({
  options: {
    addGlobalClass: true,
  },
  attached: function(e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap')
    this.getProvinceDevice();
    this.getTypeList();
  },
  data: {
    showView: false,
    "mapHeight": "100vh",
    "deviceImg": "../../images/device_off.png",
    "longitude": "113.324520", //中心经度
    "latitude": "23.099994", //中心纬度
    "scale": "5", //缩放级别
    "markers": [], //坐标标点
    "deviceList": [], //设备列表
    "polyline": [], //路线坐标
    "deviceType": "全部产品",
    "typeList": ['全部产品'],
    "typeData": [],
    // 分页
    "currentPage": 1,
    "pageSize": 6,
    "hasMoreData": true,
  },
  methods: {
    showList: function() {
      let that = this;
      that.setData({
        showView: true,
        "mapHeight": "0vh"
      })
    },
    hideList: function() {
      let that = this;
      productId = null;
      that.setData({
        showView: false,
        "mapHeight": "100vh"
      })
    },
    //页面滑动到底部
    bindDownLoad: function() {
      if (this.data.hasMoreData) {
        this.getDevieListByProvice('more', this.data.markerId, '加载更多数据')
      } else {
        wx.showToast({
          title: '没有更多数据',
        })
      }

    },
    scroll: function(event) {
      //该方法绑定了页面滚动时的事件，我这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
      this.setData({
        scrollTop: event.detail.scrollTop
      });

    },
    topLoad: function(event) {
      //   该方法绑定了页面滑动到顶部的事件，然后做上拉刷新
      this.data.currentPage = 1
      this.getDevieListByProvice('new', this.data.markerId, '下拉正在刷新数据')

    },
    /**
     * 捕捉地图改变
     */
    onMapChange: function(e) {
      if (e.type == "begin") {
        return false;
      }
      let that = this;
      this.mapCtx.getScale({
        success: function(ret) {
          if (ret.scale <= 7 && cityVision) {
            that.getProvinceDevice();
          } else if (ret.scale > 7 && !cityVision) {
            that.getCityDevice();
          }
        }
      })
    },
    /**
     * 点击标注事件
     */
    markertap(e) {
      wx.showLoading({
        title: "正在加载",
      });
      this.setData({
        markerId: e.markerId,
        currentPage: 1
      })
      this.getDevieListByProvice('new', e.markerId, '');
      console.log(this.data.markerId)
    },
    /**
     * 按省级获取设备数量
     */
    getProvinceDevice: function() {
      let that = this;
      wx.request({
        url: 'https://ztn-tech.com/uni/deviceBelong/provinceUserDeviceNum.htm',
        method: 'POST',
        data: {
          "userId": wx.getStorageSync('userid'),
          "apiKey": wx.getStorageSync('userKey'),
        },
        success: function(ret) {
          cityVision = false;
          switch (ret.data.flag) {
            case "00":
              that.changeMarker(ret.data.deviceNum);
              break;
            case "01":
              //没有设备
              break;
          }
        },
        fail: function(err) {}
      })
    },
    /**
     * 按城市获取设备数量
     */
    getCityDevice: function(id) {
      let that = this;
      wx.request({
        url: 'https://ztn-tech.com/uni/deviceBelong/cityUserDeviceNum',
        method: 'POST',
        data: {
          "userId": wx.getStorageSync('userid'),
          "apiKey": wx.getStorageSync('userKey'),
          // "provinceId": id
        },
        success: function(ret) {
          cityVision = true;
          switch (ret.data.flag) {
            case "00":
              that.changeMarker(ret.data.deviceNum);
              break;
            case "01":
              //没有设备
              break;
          }
        },
        fail: function(err) {}
      })
    },
    /**
     * 获取设备列表
     */
    getDevieListByProvice: function(mode, id, message) {
      let that = this;
      wx.showLoading({
        title: message,
      });
      wx.request({
        url: 'https://ztn-tech.com/uni/deviceBelong/cityUserDevices.htm',
        method: 'POST',
        data: {
          "userId": wx.getStorageSync('userid'),
          "cityId": id,
          "productId": productId,
          "currentPage": this.data.currentPage,
          "pageSize": this.data.pageSize,
          "apiKey": wx.getStorageSync('userKey')
        },
        success: function(ret) {
          // console.log(ret);

          switch (ret.data.flag) {
            case "00":
              if (mode == 'new') {
                var option = ret.data.devices.data;
              } else {
                let contentlistTem = [];
                if (that.data.currentPage != 1) {
                  contentlistTem = that.data.contentlist;
                }
                let contentlist = ret.data.devices.data;
                var option = contentlistTem.concat(contentlist);
              }

              if (that.data.currentPage >= ret.data.devices.last_page) {
                that.setData({
                  contentlist: option,
                  hasMoreData: false
                })
                that.initDeviceList(option);
              } else {
                that.setData({
                  contentlist: option,
                  hasMoreData: true,
                  currentPage: that.data.currentPage + 1
                })
                that.initDeviceList(option);
              }
              break;
            case "01":
              //没有设备
              break;
          }
        },
        fail: function(err) {},
        complete: function() {
          wx.hideLoading();

        }
      })
    },
    /**
     * 更换标注
     */
    changeMarker: function(options) {
      let markerArr = [];
      for (let i in options) {
        let item = {};
        item.id = Number(options[i].provinceId ? options[i].provinceId : options[i].cityId);
        item.width = 25;
        item.height = 25;
        item.latitude = Number(options[i].lat);
        item.longitude = Number(options[i].lng);
        if (options[i].num >= 99) {
          item.iconPath = "../../nums/local_99.png";
        } else {
          item.iconPath = "../../nums/local_" + options[i].num + ".png";
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
    initDeviceList: function(options) {
      let that = this;
      if (options.length == 0) {
        that.setData({
          "deviceList": []
        })
        return false;
      }
      let core = [];
      let list = [];
      for (let i in options) {
        let item = {};
        item.deviceName = options[i].deviceName;
        item.deviceCore = options[i].deviceCore;
        item.deviceAddr = options[i].adder;
        item.deviceLat = options[i].lat;
        item.deviceLng = options[i].lng;
        item.productId = options[i].productId;
        item.deviceIcon = 'https://ztn-tech.com/public/static/wechar-resource/' + options[i].iocUrl
        core.push(options[i].deviceCore)
        list.push(item);
      }
      wx.request({
        url: 'https://ztn-tech.com/uni/deviceBelong/batchGetDeviceStatus2.htm',
        method: 'POST',
        data: {
          "deviceCores": core,
          "apiKey": wx.getStorageSync('userKey')
        },
        success: function(ret) {
          let devceList = ret.data.data;
          for (let i in devceList) {
            for (let j in list) {
              if (devceList[i].deviceCore == list[j].deviceCore) {
                list[j].status = devceList[i].status;
                switch (devceList[i].status) {
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
          that.setData({
            "deviceList": list,
          });
          that.showList();
        }
      })
    },
    /**
     * 导航
     */
    navigation: function(e) {
      wx.getLocation({ //获取当前经纬度
        type: 'wgs84',
        success: function(res) {
          wx.openLocation({ //​使用微信内置地图查看位置。
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
    deviceSensor: function(option) {
      wx.navigateTo({
        url: '../sensors/sensors?deviceCore=' + option.currentTarget.dataset.devicecore,
      })
    },
    /**
     * 跳转到控制界面
     */
    deviceController: function(option) {
      let deviceName = option.currentTarget.dataset.name;
      let deviceCore = option.currentTarget.dataset.devicecore;
      wx.navigateTo({
        url: '../controller/controller?deviceName=' + deviceName + '&deviceCore=' + deviceCore,
      })
    },
    /**
     * 获取类型列表
     */
    getTypeList: function() {
      let that = this;
      wx.request({
        url: 'https://ztn-tech.com/uni/product/getUserAllProduct.htm',
        method: 'POST',
        data: {
          "userId": wx.getStorageSync("userid"),
          "apiKey": wx.getStorageSync('userKey'),
        },
        success: function(ret) {
          if (ret && ret.data.flag == "00") {
            let data = ret.data.productList;
            let list = ['全部产品'];
            let listData = [{
              "id": "0",
              "name": "全部产品"
            }];
            for (let i in data) {
              let obj = {
                "id": data[i].productId,
                "name": data[i].productName
              }
              list.push(data[i].productName);
              listData.push(obj);
            }
            that.setData({
              'typeList': list,
              "typeData": listData
            });
          }
        },
        fail: function(err) {}
      })
    },
    /**
     * 类型改变
     */
    typeChange: function(e) {
      productId = this.data.typeData[e.detail.value].id;
      this.setData({
        deviceType: this.data.typeData[e.detail.value].name,
        currentPage: 1,
      });
      this.getDevieListByProvice('new', this.data.markerId,'正在筛选');
    },

  },
})