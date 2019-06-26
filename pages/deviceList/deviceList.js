Component({
  options: {
    addGlobalClass: true,
  },

  data: {
    "showDialog": false,
    "isShow": "",
    "device_img": "../../images/device_off.png",
    "deviceList": [],
    "product": "全部产品",
    "productList": ['全部产品'],
    "statusText": '全部状态',
    "statusArray": ['全部状态', '在线', '掉线', '禁用'],
    "searchStatus": null,
    "searchName": null,
    "productData": [],
    "currentPage": 1,
    "pageSize": 20,
    "pageList": 0,
    "hasMoreData": true,
    "contentlist": [],
    "productId": null,
    "warnNum":0
  },
  attached: function(option) {
    this.getDeviceList("", true);
    this.getProductList(""); 
  },
  

  methods: {
    onPullDownRefresh: function() {
      wx.showNavigationBarLoading() //在标题栏中显示加载
      this.data.currentPage = 1
      this.getDeviceList('下拉正在刷新数据', true)
    },
    onReachBottom: function() {
      if (this.data.hasMoreData) {
        this.getDeviceList('加载更多数据', false)
      } else {
        wx.showToast({
          title: '没有更多数据',
        })
      }
    },
    pageChange: function(e) {
      let currentPage = parseInt(e.detail.value) + 1
      this.setData({
        "currentPage": currentPage,
      })
      this.getDeviceList("加载第" + currentPage + "页设备", true);
    },
    changeLayout: function(e) {
      var that = this;
      var sw = that.data.isShow;
      var itemId = e.currentTarget.id;
      if (sw == "") {
        that.setData({
          isShow: itemId
        })
      } else if (sw != itemId) {
        that.setData({
          isShow: itemId
        })

      } else if (sw == itemId) {
        that.setData({
          isShow: ""
        })
      }
    },
    initList: function(options) {
      var that = this;
      if (options.length == 0) {
        wx.hideLoading();
        that.setData({
          "deviceList": []
        })
        return false;
      }
      
      var core = [];
      var list = [];
      for (var i in options) {
        var item = {};
        let signal = options[i].signal;
        let signalcount;
        if (signal == 0) {
          signalcount = 0
        } else {
            if (25 < signal) {
              signalcount = 5
            } else if (19 < signal) {
              signalcount = 4
            } else if (13 < signal) {
              signalcount = 3
            } else if (7 < signal) {
              signalcount = 2
            }else{
              signalcount = 1
            }
        }
        
        item.count = signalcount;
        item.signal = options[i].signal;
        item.status = options[i].status;
        item.surplus = options[i].surplus;
        item.warnNum = options[i].warnNum;
        // console.log(item.surplus)
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
        url: 'https://ztn-tech.com/uni/deviceBelong/batchGetDeviceStatus2.htm',
        method: 'POST',
        data: {
          "productKey": options[0].serverMessage,
          "deviceCores": core
        },
        success: function(ret) {
          var devceList = ret.data.data;
          for (var i in devceList) {
            for (var j in list) {
              if (devceList[i].deviceCore == list[j].deviceCore) {
                switch (devceList[i].status) {
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
          that.setData({
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
      that.setData({
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
      console.log("---------" + '../controller/controller?deviceName=' + deviceName + '&deviceCore=' + deviceCore)
      wx.navigateTo({
        url: '../controller/controller?deviceName=' + deviceName + "&deviceCore=" + deviceCore,
      })
    },
    /**
     * 跳转传感器页面
     */
    deviceSensor: function(option) {
      var deviceName = option.currentTarget.dataset.name;
      var deviceCore = option.currentTarget.dataset.devicecore;
      var serverMessage = option.currentTarget.dataset.servermessage;
      var deviceid = option.currentTarget.dataset.deviceid;
      console.log("--------" + option.currentTarget.dataset.devicecore);
      wx.navigateTo({
        url: '../sensors/sensors?deviceName=' + deviceName + '&deviceCore=' + deviceCore
      })
    },
    /**
     * 跳转导航页面
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
     * 跳转到deviceInfo页面
     */
    deviceInfo: function(option) {
      var deviceCore = option.currentTarget.dataset.devicecore;
      wx.navigateTo({
        url: '../deviceInfo/deviceInfo?deviceCore=' + deviceCore,
      })
    },
    /**
     * 跳转到deviceLocal页面
     */
    deviceLocal: function(option) {
      wx.navigateTo({
        url: '../deviceLocal/deviceLocal?deviceCore=' + option.currentTarget.dataset.devicecore,
      })
    },
    /**
     * 跳转到deviceOnline界面
     */
    deviceOnline: function(option) {
      wx.navigateTo({
        url: '../deviceOnline/deviceOnline?deviceCore=' + option.currentTarget.dataset.devicecore,
      })
    },
    /**
     * 获取设备列表
     */
    getDeviceList: function(message, first = false) {
      var that = this;
      wx.showLoading({
        title: message,
      });
      wx.request({
        url: 'https://ztn-tech.com/uni/deviceBelong/getControlDevice.htm',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Cookie': wx.getStorageSync("sessionId")
        },
        data: {
          "userId": wx.getStorageSync("userid"),
          "apiKey": wx.getStorageSync('userKey'),
          "productId": that.data.productId,
          "pageSize": that.data.pageSize,
          "currentPage": that.data.currentPage,
          "status": that.data.searchStatus,
          "searchName": that.data.searchName
        },
        success: function(ret) {
          var contentlistTem = that.data.contentlist;
          switch (ret.data.flag) {
            case "00":
              // console.log(ret.data.devices)
              let total = ret.data.devices.total;
              let pageList = [];
              for (let i = 1; i <= Math.ceil(total / that.data.pageSize); i++) {
                pageList.push("第 " + i + " 页")
              }
              if (first) {
                contentlistTem = []
              }
              var contentlist = ret.data.devices.data;
              // console.log(contentlist)
              var option = contentlistTem.concat(contentlist);
              // console.log(option)
              if (that.data.currentPage >= ret.data.devices.last_page) {
                that.setData({
                  contentlist: option,
                  hasMoreData: false,
                  pageList: pageList,
                })
                that.initList(option)
                
              } else {
                that.setData({
                  contentlist: option,
                  hasMoreData: true,
                  currentPage: that.data.currentPage + 1,
                  pageList: pageList,
                })
                that.initList(option)
              }
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
        fail: function(err) {
          wx.hideLoading();
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        },
        complete: function() {
          wx.hideLoading();
          // complete
          wx.hideNavigationBarLoading() //完成停止加载
          wx.stopPullDownRefresh() //停止下拉刷新
        }
      })
    },
    /**
     * 获取类型列表
     */
    getProductList: function() {
      var that = this;
      wx.request({
        url: 'https://ztn-tech.com/uni/product/getAllProduct.htm',
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
              "id": '0',
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
            that.setData({
              'productList': list,
              "productData": listData
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
    productChange: function(e) {
      this.data.currentPage = 1
      this.setData({
        "product": this.data.productData[e.detail.value].name,
        "productId": this.data.productData[e.detail.value].id,
        "searchName": null,
      })
      this.getDeviceList("", true);
    },
    // 点击搜索按钮
    isShowToast: function(e) {

    },
    nameChange: function(e) {
      this.setData({
        "searchName": e.detail.value,
      })
    },
    statusChange: function(e) {
      // console.log(e)
      let status = e.detail.value;
      switch (status) {
        case "0":
          this.setData({
            "searchStatus": null,
            "statusText": '全部状态',
            "searchName": null,
          })

          break;
        case "1":
          this.setData({
            "searchStatus": 'ONLINE',
            "statusText": '在线',
            "searchName": null,
          })
          break;
        case "2":
          this.setData({
            "searchStatus": 'OFFLINE',
            "statusText": '离线',
            "searchName": null,
          })
          break;
        case "3":
          this.setData({
            "searchStatus": 'DISABLE',
            "statusText": '禁用',
            "searchName": null,
          })
          break;
        default:
          this.setData({
            "searchStatus": null,
            "statusText": '全部状态',
            "searchName": null,
          })
          break;
      }
      this.data.currentPage = 1
      this.getDeviceList("", true);
    },

    showSearch() {
      this.setData({
        showDialog: true
      });
    },
    noSearch() {
      this.setData({
        showDialog: false
      });
    },
    search() {
      if (this.data.searchName != null) {
        this.setData({
          searchName: this.data.searchName,
        });
        this.data.currentPage = 1
        this.getDeviceList("", true);
      }
      this.setData({
        showDialog: false,
      });
    }
  },
})