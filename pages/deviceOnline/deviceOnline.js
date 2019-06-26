// pages/deviceOnline/index.js
var util = require("../../utils/util.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		onlineList: [],
		currentPage: 1,
		pageSize: 50,
		deviceCore: null,

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			deviceCore: options.deviceCore
		})
		this.getDeviceInfo();
	},
	getDeviceInfo: function() {
		let that = this;
		wx.showLoading({
			title: '获取中',
		});
		wx.request({
			url: 'https://ztn-tech.com/uni/deviceOnline/getDevieOnlineListByCore.htm',
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
						let data = ret.data.status.data;
            if (data.length < 1) {
              wx.showToast({
                title: '暂无上下线数据',
                icon: 'none',
                duration: 2000,
                mask: true
              });
              setTimeout(function () {
                wx.navigateBack();
              }, 1000);
              return
            }
						for (let i = 0; i < data.length; i++) {
							switch (data[i].status) {
								case 'ONLINE':
									data[i].statusText = '在线';
									break;
								case 'OFFLINE':
                  data[i].statusText = '下线';
									break;
							}
							// data[i].createDate = new Date(data[i].createDate * 1000).toLocaleString()
              data[i].createDate = util.dateTime(data[i].createDate * 1000)
						}
						that.setData({
							onlineList: data,
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
