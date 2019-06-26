var player;
var isfull;
var hid;
Page({
  data: {
    text: '',
    flipvurl: '../../images/cam/flip_v.png',
    fliphurl: '../../images/cam/flip_h.png',
    avqonurl: '../../images/cam/avq_mid.png',
    avqoffurl: '../../images/cam/avq_high.png',
    intercomonurl: '../../images/cam/player_intercom_on.png',
    intercomoffurl: '../../images/cam/player_intercom_off.png',
    videorecordurl: '../../images/cam/video_record_normal.png',
    videophotourl: '../../images/cam/video_photo_normal.png',
    videotopurl: '../../images/cam/top.png',
    videolefturl: '../../images/cam/left.png',
    videorighturl: '../../images/cam/right.png',
    videoboomurl: '../../images/cam/boom.png',
    fullscreenurl: '../../images/cam/full.png',
    audiourl: '../../mp3/click.wav',
    playurl: '',
    playingurl: '../../images/cam/play.png',
    pauseurl: '../../images/cam/pause.png',
    backurl: '../../images/cam/back.png',
    isalarmon: false,
    isavqon: false,
    isintercomon: false,
    ismicon: false,
    isComplete: false,
    autoplay: false,
    ishorizontal: false,
    playing: false,
    ishidden: true,
    isbig: false,
    top: '50%',
    hid: '',
    showTopTips:false
  },
  sendCommand(code) {
    wx.request({
      url: 'https://ztn-tech.com/uni/DeviceCamera/controlDeviceNoAuth',
      data: {
        "userId": wx.getStorageSync('userid'),
        "apiKey": wx.getStorageSync('userKey'),
        "hid": hid,
        "actionCode": code,
      },
      method: 'POST',
      // 设置请求的 header
      header: { "Content-Type": "application/json" },
      success: function (res) {
        if (res.data.flag == "00") {
          // console.log('发送命令成功' + obj);
        }
      },
      fail: function (res) {
        console.log(JSON.stringify(res));
      },
      complete: function () {
        wx.stopPullDownRefresh()
      }
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
      header: { "Content-Type": "application/json" },
      success: function (res) {
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
      fail: function (res) {
        console.log(JSON.stringify(res));
      },
      complete: function () {
        console.log('请求完成');
        wx.stopPullDownRefresh()
      }
    })
  },
  hiddenaction() {
    var that = this;
    if (isfull === false) {
      that.setData({
        ishidden: !that.data.ishidden
      })
    }
  },
  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    hid = options.hid;
    let dataserver = options.dataserver;
    isfull = false;
    this.pushCloud(dataserver)
    wx.setNavigationBarTitle({ title: '实时视频' })

  },
  onUnload:function(options){
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
      header: { "Content-Type": "application/json" },
      success: function (res) {
        // console.log(res.data)
        if (res.data.flag == "00") {
          
        }

      },
      fail: function (res) {
        console.log(JSON.stringify(res));
      },
      complete: function () {
        console.log('请求完成');
        wx.stopPullDownRefresh()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  onReady: function () {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myaudio')
    player = wx.createLivePlayerContext('liveplayer');
  },
  pictureAction:function(e){
    this.setData({
      text: e.currentTarget.dataset.label,
    })
    this.showTopTips();
    this.audioCtx.play()
    this.sendCommand(103);
    this.setData({
      isavqon: !this.data.isavqon,
      text: this.data.isavqon ? '画质：高清' : '画质：超清'
    })
  },
  muteAction: function(e){
    this.setData({
      text: e.currentTarget.dataset.label,
    })
    this.showTopTips();
    this.audioCtx.play()
    this.setData({
      isintercomon: !this.data.isintercomon,
      text: this.data.isintercomon ? '声音开启' : '声音关闭'
    })
  },
  alertAction:function(e){
    this.setData({
      isalarmon: !this.data.isalarmon,
      text: this.data.isalarmon ? '报警关闭' : '报警开启'
    })
  },
  clickbtnAction: function (e) {
    console.log(e)
    this.setData({
      text:e.currentTarget.dataset.label,
    })
    this.showTopTips();
    this.audioCtx.play()
    this.sendCommand(e.currentTarget.id);
  },
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  play() {
    var that = this;
    that.setData({
      ishidden: true
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
        top: '50%',
        ishidden: true
      })
    }
    isfull = !isfull;
    that.setData({
      ishorizontal: !that.data.ishorizontal
    })
  },

})

