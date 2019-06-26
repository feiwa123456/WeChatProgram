var deviceCore;

const hours = [];
const minutes = [];
const thours = [];
const tminutes = [];


for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i)
}

for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  thours.push("" + i)
}

for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i)
}

for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  tminutes.push("" + i)
}
var app = getApp()

var player;
var isfull;
var hid;



Page({
  data: {
    isShow: "",
    multiArray: [hours, minutes, thours, tminutes],
    multiIndex: [0, 0, 0, 0],
    SelectArray: [],
    returndata: null,
    deviceName: "",
    deviceCore: null,
    showCamList: false,
    cams: [],
    showVideo: false,
    ishorizontal: false,
    playing: false,
    ishidden: true,
    fullscreenurl: '../../images/cam/full.png',
    playurl: '',
    playingurl: '../../images/cam/play.png',
    pauseurl: '../../images/cam/pause.png',
    top: '40%',
    hid: '',
    autoplay: false,
  },
  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  onLoad: function(e) {

    let that = this;
    var returndata = [];
    deviceCore = e.deviceCore;
    this.setData({
      "deviceName": e.deviceName,
      "deviceCore": e.deviceCore
    });
    this.getSettingList();
    this.getCamList();
  },
  fullscren() {
    var that = this;
    if (isfull === false) {
      player.requestFullScreen({});
      console.log('点击全屏')
      that.setData({
        top: '65%'
      })
    } else {
      player.exitFullScreen({});
      console.log('退出全屏')
      that.setData({
        top: '40%',
        ishidden: true
      })
    }
    isfull = !isfull;

    that.setData({
      ishorizontal: !that.data.ishorizontal
    })
  },
  pushCloud(dataserver) {
    let that = this
    var ipurl = dataserver.split(';')[0].substring(6).split(":")[0]
    wx.request({
      url: 'https://ztn-tech.com/uni/DeviceCamera/pushCloudRtmpNoAuth',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "hid": hid,
        "pushTime": 1800,
        "channel": "live"
      },
      method: 'POST',
      // 设置请求的 header
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        // console.log(res.data)
        if (res.data.flag == "00") {
          var playurl = "rtmp://" + ipurl + ":1935/live/" + hid;
          // console.log(playurl);
          //微信小程序调用函数
          that.setData({
            playurl: playurl,
            autoplay: true,
            playing: true,
            ishidden: false
          })
        }

      },
      fail: function(res) {
        console.log(JSON.stringify(res));
      },

      complete: function() {
        console.log('请求完成');
        wx.stopPullDownRefresh()

      }
    })
  },
  camTap(option) {
    let that = this;
    hid = option.currentTarget.dataset.hid
    let dataserver = option.currentTarget.dataset.dataserver
    console.log(dataserver)
    this.audioCtx = wx.createAudioContext('myaudio')
    player = wx.createLivePlayerContext('liveplayer');

    this.pushCloud(dataserver)
    wx.setNavigationBarTitle({
      title: '实时视频'
    })
    if (this.data.playing === true) {
      player.pause()
      console.log("暂停");
    } else {
      player.resume()
      console.log("恢复播放");
    }
    that.setData({
      playing: !that.data.playing
    })
    this.setData({
      ishidden: true,
      showVideo: true,
      showCamList: false,
    });
  },
  hideModal(e) {
    this.setData({
      "showCamList": false,
    })
  },
  handleGetCam: function() {
    this.setData({
      "showCamList": true,
    });
  },
  //点击item.settingType=='6'，触发的事件
  btnGroupSetting: function(e) {
    this.setData({
      nowSettingId: e.currentTarget.dataset.item.settingId,
      nowSetting: e.currentTarget.dataset.item2.eName,
      nowPort: e.currentTarget.dataset.item.port,
      childPort: e.currentTarget.dataset.item.childPort

    })
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, e.currentTarget.dataset.item2.param, this.data.nowPort, this.data.childPort)
    wx.showLoading()
  },
  //点击图片
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
  getSettingList: function() {

    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceSetting/getDeviceSetting',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "deviceCore": that.data.deviceCore,

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function(res) {
   
        console.log(res.data.SettingList)
        var data = res.data.SettingList;
        for (var i = 0; i < data.length; i++) {
          if (data[i].settingType == 2) {
            if (data[i].val > 0) {
              data[i].val = false
            } else {
              data[i].val = true
            }
          } else if (data[i].settingType == 6) {
            var cmdList = data[i].setting.split(' ');
            data[i].setting = [];
            for (var j = 0; j < cmdList.length; j++) {
              let ce = cmdList[j].split(':');
              let item = {
                'cName': ce[0],
                'eName': ce[1],
                'param': ce[2],
                'now': false,
              }
              if (data[i].val == ce[2]){
                item.now= true;
              }
              data[i].setting.push(item)
            }
          }
        }
        that.setData({
          returndata: data,
        })
        if (data.length < 1) {
          wx.showToast({
            title: '暂无控制数据',
            icon: 'none',
            duration: 1000,
            mask: true
          })
          setTimeout(function() {
            wx.navigateBack();
          }, 1000);
        }
      },
      fail: function(err) {

        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000,
          mask: true
        });
      }
    })
  },
  getCamList: function() {
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
      success: function(res) {
        var data = res.data.cameraList;
        that.setData({
          cams: data,
        })

      }
    })
  },
  // 定时设置 
  bindTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.port,
      childPort: e.currentTarget.dataset.childPort

    })
    var bean = this.data.returndata;
    // console.log(bean.length)
    for (var i = 0; i < bean.length; i++) {
      // console.log("--" + bean[i].settingId + "------" + this.data.nowSettingId)
      if (bean[i].settingId == this.data.nowSettingId) {
        bean[i].val = e.detail.value
        console.log("bean[i].val------" + bean[i].val)
        break;
      }

    }
    this.setData({
      returndata: bean
    })
    console.log(this.data.returndata)
    console.log("点击的settingid" + this.data.nowSettingId + "时间" + e.detail.value)
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, e.detail.value, this.data.nowPort, this.data.childPort)
    wx.showLoading()
  },
  //时间段设置 bindMultiPickerChange
  bindMultiPickerChange: function(e) {
    //  console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.port,
      childPort: e.currentTarget.dataset.childPort
    })
    const index = this.data.multiIndex;
    const hour = this.data.multiArray[0][index[0]]
    const minute = this.data.multiArray[1][index[1]]
    const thour = this.data.multiArray[2][index[2]]
    const tminute = this.data.multiArray[3][index[3]]
    var bean = this.data.returndata;
    for (var i = 0; i < bean.length; i++) {
      //  console.log("--" + bean[i].settingId + "------" + this.data.nowSettingId)
      if (bean[i].settingId == this.data.nowSettingId) {
        bean[i].val = hour + ':' + minute + ' / ' + thour + ':' + tminute,
          console.log("bean[i].val------" + bean[i].val)
        this.saveSetting(this.data.nowSettingId, this.data.nowSetting, bean[i].val, this.data.nowPort, this.data.childPort)
        wx.showLoading()
        break;
      }
    }
    this.setData({
      returndata: bean
    })
  },
  //时间段设置 bindMultiPickerColumnChange
  bindMultiPickerColumnChange: function(e) {
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },
  //固定参数 bindSelectPickerChange
  bindSelectPickerChange: function(e) {
    let param = parseInt(e.detail.value) + 1
    console.log('picker发送选择改变，携带值为', param)
    this.setData({
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.port,
      childPort: e.currentTarget.dataset.childPort
    })
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, param, this.data.nowPort, this.data.childPort)
    wx.showLoading()
  },
  //确认按钮 触发事件
  cusTomInput: function(e) {
    this.setData({
      customdata: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.port,
      childPort: e.currentTarget.dataset.childPort
    })
  },
  customBtnClick: function(e) {
    console.log("customdata：" + this.data.customdata + "settingId：" + this.data.nowSettingId)
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, this.data.customdata, this.data.nowPort, this.data.childPort)
    wx.showLoading()
  },
  nopBtnClick: function(e) {
    this.setData({
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.port,
      childPort: e.currentTarget.dataset.childPort
    })
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, null, this.data.nowPort, this.data.childPort)
    wx.showLoading()
  },
  choseParameter: function(e) {
    this.getSettingParameter(e.currentTarget.dataset.settingid);
  },
  //switch按钮  触发事件
  switchChange: function(e) {
    this.setData({
      switchdata: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.port,
      childPort: e.currentTarget.dataset.childPort
    })
    console.log("switchdata:" + this.data.switchdata + "switchId：" + this.data.nowSettingId)
    if (this.data.switchdata == true) {
      this.saveSetting(this.data.nowSettingId, this.data.nowSetting, '1', this.data.nowPort, this.data.childPort)
    } else {
      this.saveSetting(this.data.nowSettingId, this.data.nowSetting, '0', this.data.nowPort, this.data.childPort)
    }
    wx.showLoading()

  },
  saveSetting: function(settingId, setting, param, port, childPort) {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/ioc/settingCmd',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "setting": setting,
        "param": param,
        "port": port,
        "deviceCore": deviceCore,
        "childPort": childPort

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function(res) {
        wx.hideLoading();
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
        that.getSettingList()
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
  getSettingParameter: function(settingId) {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/uni/deviceSettingParameter/getSettingParameters',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "settingId": settingId,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function(res) {
        var pList = res.data.settingParameters;
        var p = [];
        for (var i = 0; i < pList.length; i++) {
          p.push(pList[i].val);
        }
        that.setData({
          SelectArray: p
        })
      }
    });

  },
  onUnload: function(options) {
    let that = this
    wx.request({
      url: 'https://ztn-tech.com/uni/DeviceCamera/stopCloudRtmpNoAuth',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "hid": hid,
      },
      method: 'POST',
      // 设置请求的 header
      header: {
        "Content-Type": "application/json"
      },
      success: function(res) {
        // console.log(res.data)
        if (res.data.flag == "00") {

        }

      },
      fail: function(res) {
        console.log(JSON.stringify(res));
      },
      complete: function() {
        console.log('请求完成');
        wx.stopPullDownRefresh()
      }
    })
  },
  portChange:function (e){
    console.log(e)
    this.setData({
      param: e.currentTarget.dataset.val,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.detail.value,
      childPort: e.currentTarget.dataset.childPort
    })
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, this.data.param, this.data.nowPort, this.data.childPort)
    console.log(this.data.nowSettingId)
    console.log(this.data.nowSetting)
    console.log(this.data.nowPort)
    console.log(this.data.childPort)
    console.log(this.data.param)

  },
  childportChange:function(e){
    // console.log(e)
    this.setData({
      param: e.currentTarget.dataset.val,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowPort: e.currentTarget.dataset.nowPort,
      childPort: e.detail.value,
    })
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, this.data.param, this.data.nowPort, this.data.childPort)

  }

})