import * as echarts from '../../ec-canvas/echarts';
var util = require("../../utils/util.js")

var chart_data = [];
var sensorId;
var startDateData = 0;
var endDateData = 0;

Page({
  data: {
    "HistoricalOption": "",
    "HistoricalData": "",
    "RealTimeShow": true,
    "RealTimeList": [],
    "chartList": [],
    "deviceName": "",
    "filterShow": false,
    "startDate": "开始日期",
    "endDate": "结束日期",
    "isWesocket":true,
    "sensorName":"",
    ec: {
      lazyLoad: true
    },
  },
  onLoad: function(e) {
    this.setData({
      "deviceCore": e.deviceCore,
    });
    sensorId = e.sensorId;
    this.getCharts();
    

  },
  onReady: function() {},
  onShow: function() {
    this.dynamicChange();
    
  },
  onUnload: function () {
    console.log('App onUnload');
    wx.closeSocket();

  },
  /**
   * 获取表单数据
   */
  getCharts: function() {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceBelong/querySensorDataById.htm',
      method: 'POST',
      data: {
        'userId': wx.getStorageSync('userid'),
        'apiKey': wx.getStorageSync('userKey'),
        "sensorId": sensorId,
      },
      success: function(ret) {
        that.setData({
          "deviceName": ret.data.info[0].deviceName,
          "HistoricalOption": ret.data.info.explain,
          "HistoricalData": ret.data.data,
          "sensorName": ret.data.info[0].sensorName
        });
        var chartOptions = ret.data.info.explain;
        var chartData = ret.data.data;
        that.RealTimeData(chartOptions);
        wx.setNavigationBarTitle({
          title: that.data.sensorName,

        })
      }
    })
  },
  /**
   * 获取表单数据
   */
  getData: function() {
    wx.showLoading({
      "title": "数据加载中"
    });
    setTimeout(function() {
      wx.hideLoading()
    }, 2500);
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceBelong/getSensorDataByDate.htm',
      method: 'POST',
      data: {
        'userId': wx.getStorageSync('userid'),
        "sensorId": sensorId,
        "startDate": startDateData,
        "endDate": endDateData,
        "apiKey": wx.getStorageSync('userKey')
      },
      success: function(ret) {
        var chartOptions = ret.data.info.explain;
        var chartData = ret.data.data;
        that.initData(chartOptions, chartData);
      }
    })
  },
  /**
   *实时监控数据
   */
  RealTimeData: function(options) {
    var that = this;
    for (let i = 0; i < options.length; i++) {
      options[i].lastDateTime = util.dateTime(options[i].lastDateTime * 1000);
    }
    that.setData({
      "RealTimeList": options
    })
  },
  /**
   *点击实时监控按钮
   */
  RealTimeSelected: function() {
    var that = this;
    that.setData({
      "RealTimeShow": true
    });
  },
  /**
   *getDate
   */

  handleGetData: function() {
    wx.showLoading({});
    this.saveSetting("getData");
  },
  saveSetting: function(setting, param) {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/ioc/settingCmd',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "setting": setting,
        "param": null,
        "port": 0,
        "deviceCore": that.data.deviceCore,

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function(res) {
        if (res.data.flag == '400') {
          wx.showToast({
            title: '缺少参数',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '00') {
          wx.showToast({
            title: '设置成功',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '611') {
          wx.showToast({
            title: '设备不在线，重试准备',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '601') {
          wx.showToast({
            title: '设备不在线',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '602') {
          wx.showToast({
            title: '操作间隔过小',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '613') {
          wx.showToast({
            title: '设备服务器异常，重试准备',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '603') {
          wx.showToast({
            title: '设备服务器异常',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '614') {
          wx.showToast({
            title: '设备超时，重试准备',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == '604') {
          wx.showToast({
            title: '设备超时',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        } else if (res.data.flag == "605") {
          switch (res.data.msg) {
            case "setting":
              wx.showToast({
                title: '命令有误',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
            case "port":
              wx.showToast({
                title: '端口有误',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
            case "param":
              wx.showToast({
                title: '参数有误',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
            case "unSuccess":
              wx.showToast({
                title: '设置失败',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
            default:

              wx.showToast({
                title: '未知错误' + res.data.msg,
                icon: 'none',
                duration: 2000,
                mask: true
              });
              break;
          }

        } else if (res.data.flag == "07") {

          wx.showToast({
            title: '你没有权限控制设备',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        }
      },
      complete: function() {
        wx.hideLoading();

      }
    })

  },
  /**
   * 
   *跳转到控制
   */
  handleGo2Set: function() {
    var that = this;
    wx.navigateTo({
      url: '../controller/controller?deviceName=' + that.data.deviceName + '&deviceCore=' + that.data.deviceCore,
    })

  },
  /**
   *点击历史数据按钮
   */
  HistoricalSelected: function(option) {
    var that = this;
    wx.showLoading({
      "title": "图表加载中"
    });
    setTimeout(function() {
      wx.hideLoading()
    }, 2500);
    that.setData({
      "RealTimeShow": false
    })
    that.initData(that.data.HistoricalOption, that.data.HistoricalData);

  },
  /**
   * 数据处理
   */
  initData: function(options, data) {
    this.chart = [];
    var charts = [];
    var that = this;
    for (var i in options) {
      if (options[i].type != "static") {
        var eName = options[i].eName;
        var item = {};
        var details = [];
        for (var j in data) {
          var obj = JSON.parse(data[j].val);
          var newDate = new Date();
          var updateTime = data[j].updateTime;
          newDate.setTime(updateTime * 1000);
          details.push({
            val: obj[eName],
            time: (newDate.getMonth() + 1) + "-" + newDate.getDate()
          });
        }
        item.data = details;
        item.name = options[i].cName;
        item.id = "mychart-dom-multi-" + eName.replace('.', '_');
        item.canvas = "mychart-multi-" + eName.replace('.', '_');
        charts.push(item);
      }
    }
    this.setData({
      "chartList": charts
    });
    chart_data = charts;
    for (var i in charts) {
      that.selectComponent('#' + charts[i].id).init((canvas, width, height) => {
        var chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        that.chart.push(chart);
        setOption(chart);
        return chart;
      });
    }
  },
  /**
   * 展示筛选框
   */
  showFilter: function() {
    if (this.data.filterShow) {
      return false;
    }
    this.setData({
      "startDate": "开始日期",
      "endDate": "结束日期",
      "filterShow": true,
    })
  },
  /**
   * 关闭筛选框
   */
  closeFilter: function() {
    this.setData({
      "filterShow": false,
    });
    if (startDateData != 0 || endDateData != 0) {
      startDateData = 0;
      endDateData = 0;
      this.getCharts();
    }
  },
  /**
   * 开始日期修改
   */
  startDateChange: function(e) {
    var date = e.detail.value;
    this.setData({
      "startDate": date,
    });
    date = date.replace(/-/g, '/');
    var timestamp = new Date(date).getTime() / 1000;
    startDateData = timestamp;
  },
  /**
   * 结束日期修改
   */
  endDateChange: function(e) {
    var date = e.detail.value;
    this.setData({
      "endDate": e.detail.value,
    });
    date = date.replace(/-/g, '/');
    var timestamp = new Date(date).getTime() / 1000;
    endDateData = timestamp;
  },
  /**
   * 动态更新
   */
  dynamicChange: function (e) {
    var that = this;
      wx.connectSocket({
        url: 'wss://ztn-tech.com/wss',
      })
      wx.onSocketOpen(function (res) {
        console.log('WebSocket连接已打开！');
        var mCmd = {
          "cmd": "bindSensor",
          "parameters": sensorId
        }
        wx.sendSocketMessage({
          data: JSON.stringify(mCmd),
          success: function (ret) {
            console.log('WebSocket监听成功！');
            console.log(chart_data);
            for (var i in chart_data) {
              var canvasId = chart_data[i].canvas;
              chart_data[i].data = [];
              for (var j in that.chart) {
                if (canvasId == that.chart[j]._dom.canvasId) {
                  setOption(that.chart[j]);
                  break;
                }
              }
            }
          },
          fail: function (err) {
            console.log('WebSocket监听失败！');
          }
        })
      })
      wx.onSocketError(function (res) {
        console.log('WebSocket连接打开失败，请检查！')
      })
      wx.onSocketMessage(function (res) {
        console.log('收到服务器内容：' + res.data)
        wx.showToast({
          title: '数据上传',
          icon: 'none',
          duration: 1000,
          mask: true
        });
        that.dealSocketData(res.data);
      })
      wx.onSocketClose(function (res) {
        console.log('WebSocket 已关闭！')
      })
  },
  
  /**
   * 动态加载图表数据
   */

  dealSocketData: function(str) {
    let that = this;
    let option = that.data.HistoricalOption;
    let val = JSON.parse(str);
    let data = JSON.parse(val.val);
    for (let name in data) {
      // console.log(data)
      // console.log(name)
      for (let j in option) {
        let eName = option[j].eName
        if (eName == name) {
          option[j].lastVal = data[eName]
          that.setData({
            "RealTimeList": option
          })
        }
      }
    }
    // console.log(option)
  }
});

/**
 * 渲染图表
 */
function setOption(chart) {
  console.log(chart);
  var canvas_id = chart._dom.canvasId;
  var _data;
  var _title = "";
  for (var i in chart_data) {
    if (chart_data[i].canvas == canvas_id) {
      _title = chart_data[i].name;
      _data = chart_data[i].data;
      break;
    }
  }
  var xAxis_data = [];
  var series_data = [];
  for (var i in _data) {
    xAxis_data.push(_data[i].time);
    series_data.push(_data[i].val);
  }
  var option = {
    title: {
      text: _title
    },
    // dataZoom: [{
    //   type: 'inside',
    //   start: 0,
    //   end: 10000
    // }, {
    //   start: 0,
    //   end: 10000,
    //   handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
    //   handleSize: '80%',
    //   handleStyle: {
    //     color: '#fff',
    //     shadowBlur: 3,
    //     shadowColor: 'rgba(0, 0, 0.3, 0.6)',
    //     shadowOffsetX: 2,
    //     shadowOffsetY: 2
    //   }
    // }],
    color: ['#00BFFF', '#008000', '#FF69B4', '#BA55D3', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxis_data
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: series_data,
      type: 'line',
      areaStyle: {},
      smooth: true,
      markPoint: {
        data: [{
            type: 'max',
            name: '最大值'
          },
          {
            type: 'min',
            name: '最小值'
          }
        ]
      },
      markLine: {
        data: [{
          type: 'average',
          name: '平均值'
        }]
      },

      symbol: 'none',
      sampling: 'average',
      itemStyle: {
        normal: {
          color: 'rgb(255,70,131)'
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgb(123,218,227)'
          }, {
            offset: 1,
            color: 'rgb(123,218,227)'
          }])
        }
      },
    }]
  };
  chart.setOption(option);
}