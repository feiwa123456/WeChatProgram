 // pages/deviceLocal/index.js
var util = require("../../utils/util.js")

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		deviceCore: null,
		mapHeight: "40vh",
		scale: "16", //缩放级别
		markers: [], //坐标标点
		currentPage: 1,
		pageSize: 50,
		deviceCore: null,
		lat:null,
		lng:null,
    localList:[],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			deviceCore: options.deviceCore
		})
		this.getDeviceLocal();
	},
	getDeviceLocal: function() {
		let that = this;
		wx.showLoading({
			title: '获取中',
		});
		wx.request({
			url: 'https://ztn-tech.com/uni/deviceLocal/getListByCore.htm',
			method: 'POST',
			header: {
				'content-type': 'application/json',
				'Cookie': wx.getStorageSync("sessionId")
			},
			data: {
				"userId": wx.getStorageSync("userid"),
				"apiKey": wx.getStorageSync('userKey'),
				"deviceCore": that.data.deviceCore,
				"pageSize": that.data.pageSize,
				"currentPage": that.data.currentPage
			},
			success: function(ret) {
				switch (ret.data.flag) {
					case "00":
						let data = ret.data.locals.data;
            if (data.length <1){
              wx.showToast({
                title: '暂无数据',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              setTimeout(function () {
                wx.navigateBack();
              }, 1000);
              return
            }
						let markers = [];
						let lat,lng;
						let j =0;
						for (let i = 0; i < data.length; i++) {
							lat = data[i].lat
							lng = data[i].lng
							j = i+1
							markers.push({
								latitude: lat,
								longitude:lng,
								width: 25,
								height: 25,
								iconPath : '../../nums/local_'+j+'.png',
							})
              data[i].createDate = util.dateTime(data[i].createDate * 1000);
              data[i].radius = data[i].radius+'米'
						}
						that.setData({
							lat:lat,
							lng:lng,
							markers:markers,
							localList: data,
						})
						break;
					default:
						wx.showToast({
							title: '暂无数据',
							icon: 'none',
							duration: 2000,
							mask: true
						});
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
})
