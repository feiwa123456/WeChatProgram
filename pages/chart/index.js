import * as echarts from '../../ec-canvas/echarts';
var chart_data = [];
var sensorId;
var startDateData = 0;
var endDateData = 0;

Page({
  data: {
    "chartList": [],
    "deviceName": "",
    "filterShow": false,
    "startDate": "开始日期",
    "endDate": "结束日期",
    ec: {
      lazyLoad: true
    },
  },
  onLoad: function(e) {
    sensorId = e.sensorId;
    this.getCharts();
  },
  onReady: function() {},
  /**
   * 获取表单数据
   */
  getCharts: function() {
    wx.showLoading({
      "title": "图表加载中"
    });
    setTimeout(function() {
      wx.hideLoading()
    }, 2500);
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/device/wxQuerySensorDataById.htm',
      method: 'POST',
      data: {
        'userId': wx.getStorageSync('userid'),
        'apiKey': wx.getStorageSync('userKey'),
        "sensorId": sensorId,
      },
      success: function(ret) {
        _this.setData({
          "deviceName": ret.data.info[0].deviceName
        });
        var chartOptions = ret.data.info.explain;
        var chartData = ret.data.data;
        _this.initData(chartOptions, chartData);
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
    var _this = this;
    wx.request({
      url: 'https://ztn-tech.com/device/wxGetSensorDataByDate.htm',
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
        _this.initData(chartOptions, chartData);
      }
    })
  },
  /**
   * 数据处理
   */
  initData: function(options, data) {
    this.chart = [];
    var charts = [];
    var _this = this;
    for (var i in options) {
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
    this.setData({
      "chartList": charts
    });
    chart_data = charts;
    for (var i in charts) {
      _this.selectComponent('#' + charts[i].id).init((canvas, width, height) => {
        var chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        _this.chart.push(chart);
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
  dynamicChange: function(e) {
    var _this = this;
    if (e.detail.value) {
      wx.connectSocket({
        url: 'wss://ztn-tech.com/wss',
      })
      wx.onSocketOpen(function(res) {
        console.log('WebSocket连接已打开！');
        var mCmd = {
          "cmd": "bindSensor",
          "parameters": sensorId
        }
        wx.sendSocketMessage({
          data: JSON.stringify(mCmd),
          success: function(ret) {
            console.log('WebSocket监听成功！');
            console.log(chart_data);
            for (var i in chart_data) {
              var canvasId = chart_data[i].canvas;
              chart_data[i].data = [];
              for (var j in _this.chart) {
                if (canvasId == _this.chart[j]._dom.canvasId) {
                  setOption(_this.chart[j]);
                  break;
                }
              }
            }
          },
          fail: function(err) {
            console.log('WebSocket监听失败！');
          }
        })
      })
      wx.onSocketError(function(res) {
        console.log('WebSocket连接打开失败，请检查！')
      })
      wx.onSocketMessage(function(res) {
        console.log('收到服务器内容：' + res.data)
        _this.dealSocketData(res.data);
      })
      wx.onSocketClose(function(res) {
        console.log('WebSocket 已关闭！')
      })
    } else {
      wx.closeSocket();
      this.closeFilter();
      this.getCharts();
    }
  },
  /**
   * 动态加载图表数据
   */
  dealSocketData: function(str) {
    var _this = this;
    var val = JSON.parse(str);
    var data = val.val;
    var updateTime = val.updateTime;
    var newDate = new Date();
    newDate.setTime(updateTime * 1000);
    var time = newDate.getMinutes() + ":" + newDate.getSeconds()
    for (var i in data) {
      var canvasName = "mychart-multi-" + i.replace('.', '_');
      for (var j in chart_data) {
        if (chart_data[j].canvas == canvasName) {
          var obj = {
            val: data[i],
            time: time
          }
          chart_data[j].data.push(obj);
          for (var k in _this.chart) {
            if (_this.chart[k]._dom.canvasId == canvasName) {
              setOption(_this.chart[k]);
            }
          }
          break;
        }
      }
    }
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
    dataZoom: [{
      type: 'inside',
      start: 0,
      end: 10
    }, {
      start: 0,
      end: 10,
      handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      handleStyle: {
        color: '#fff',
        shadowBlur: 3,
        shadowColor: 'rgba(0, 0, 0.3, 0.6)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }
    }],
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
      }

    }]
  };
  chart.setOption(option);
}