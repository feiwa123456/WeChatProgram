var serverMessage;
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
Page({
  data: {
    multiArray: [hours, minutes, thours, tminutes],
    multiIndex: [0, 0, 0, 0],
    SelectArray: [[]],
    SelectIndex: [0],
    returndata: null,
    deviceName: "",
    deviceCore: null
  },
  onLoad: function(e) {
    let that = this;
    var returndata = [];
    serverMessage = e.serverMessage;
    deviceCore = e.deviceCore;
    this.setData({
      "deviceName": e.deviceName
    });
    this.setData({
      "deviceCore": e.deviceCore
    })

    this.getSettingList();

  },
  getSettingList: function() {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/DeviceSetting/wxGetDeviceSetting',
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
        var data = res.data.SettingList
        for (var i = 0; i < data.length; i++) {
          if (data[i].settingType == 2) {
            if (data[i].val > 0) {
              data[i].val = false
            } else {
              data[i].val = true
            }
          }
        }
        that.setData({
          returndata: data,
        })
      //  console.log(that.data.returndata)
      }
    })
  },
  // 定时设置 
  bindTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowTarget: e.currentTarget.dataset.target
    })
    var bean = this.data.returndata;
    console.log(bean.length)
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
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, e.detail.value, this.data.nowTarget)
  },
  //时间段设置 bindMultiPickerChange
  bindMultiPickerChange: function(e) {
    //  console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowTarget: e.currentTarget.dataset.target
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
        bean[i].val = hour + ':' + minute + '/' + thour + ':' + tminute,
          console.log("bean[i].val------" + bean[i].val)
        this.saveSetting(this.data.nowSettingId, this.data.nowSetting, bean[i].val, this.data.nowTarget)
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
    console.log('picker发送选择改变，携带值为', e.detail.value)
    
    this.setData({
      SelectIndex: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowTarget: e.currentTarget.dataset.target
    })
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, e.detail.value, this.data.nowTarget)
    const index = this.data.SelectIndex;
    const param = this.data.SelectArray[0][index[0]]
    var bean = this.data.returndata;
    for (var i = 0; i < bean.length; i++) {
      //  console.log("--" + bean[i].settingId + "------" + this.data.nowSettingId)
      if (bean[i].settingId == this.data.nowSettingId) {
        bean[i].val = param
        break;
      }
    }
    this.setData({
      returndata: bean
    })

  },

  //固定参数 bindSelectPickerColumnChange
  bindSelectPickerColumnChange: function(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      SelectArray: this.data.SelectArray,
      SelectIndex: this.data.SelectIndex
    };
    data.SelectIndex[e.detail.column] = e.detail.value;
    this.setData(data);
  },

  //确认按钮 触发事件
  cusTomInput: function(e) {
    this.setData({
      customdata: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowTarget: e.currentTarget.dataset.target
    })
  },
  customBtnClick: function(e) {
    console.log("customdata：" + this.data.customdata + "settingId：" + this.data.nowSettingId)
    this.saveSetting(this.data.nowSettingId, this.data.nowSetting, this.data.customdata, this.data.nowTarget)
  },
  choseParameter:function(e){
    this.getSettingParameter(e.currentTarget.dataset.settingid);
  },
  //switch按钮  触发事件
  switchChange: function(e) {
    this.setData({
      switchdata: e.detail.value,
      nowSettingId: e.currentTarget.dataset.settingid,
      nowSetting: e.currentTarget.dataset.setting,
      nowTarget: e.currentTarget.dataset.target
    })
    console.log("switchdata:" + this.data.switchdata + "switchId：" + this.data.nowSettingId)
    if (this.data.switchdata == true) {
      this.saveSetting(this.data.nowSettingId, this.data.nowSetting, '1', this.data.nowTarget)
    } else {
      this.saveSetting(this.data.nowSettingId, this.data.nowSetting, '0', this.data.nowTarget)
    }

  },
  saveSetting: function(settingId, setting, parameter, target) {
    var that = this;
    wx.request({
      url: 'https://ztn-tech.com/ioc/wxSettingCmd',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "setting": setting,
        "settingId": parseInt(settingId),
        "serverMessage": serverMessage,
        "parameter": parameter,
        "target": target,
        "deviceCore": deviceCore,

      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: "POST",
      success: function(res) {
        if (res.data.flat == '04'){
          wx.showToast({
            title: '设备未激活',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        }
        else if (res.data.flat == '05') {
          wx.showToast({
            title: '设备不在线',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        }
        else if (res.data.flat == '06') {
          wx.showToast({
            title: '设备回应超时',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        }
        else if (res.data.data.Success == false) {
          wx.showToast({
            title: '转发失败',
            icon: 'none',
            duration: 2000,
            mask: true
          });
        }

      }
    })

  },
  getSettingParameter: function(settingId) {
    var that =this;
    wx.request({
      url: 'https://ztn-tech.com/DeviceSettingParameter/wxGetSettingParameters',
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
        for(var i=0;i<pList.length;i++){
            p.push(pList[i].val);
        }
        console.log(p);
        that.setData({
          SelectArray: [["52", "525", "525741"]]
        
        })
        console.log(that.data.SelectArray);
      }
    })

  }

})