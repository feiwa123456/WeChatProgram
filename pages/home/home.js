const app = getApp()
var util = require("../../utils/util.js")
Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://ztn-tech.com/public/static/wechar-resource/carousel/slide0.png'
    }, {
      id: 1,
      type: 'image',
      url: 'https://ztn-tech.com/public/static/wechar-resource/carousel/slide1.png',
    }, {
      id: 2,
      type: 'image',
      url: 'https://ztn-tech.com/public/static/wechar-resource/carousel/slide2.png'
    }, {
      id: 3,
      type: 'image',
      url: 'https://ztn-tech.com/public/static/wechar-resource/carousel/slide3.png'
    }],
    images: {
      mode: 'aspectFit',
    },
    search: {
      "type": "text",
      "confirm-type": "search",
      "adjust-position": "fasle",
      "bindconfirm": function(ret) {
        // console.log(ret);
      }
    },
    elements: [{
        title: '太阳能板',
        name: 'Solar',
        color: 'cyan',
        icon: 'item_broad.png'
      },
      {
        title: '储能电池',
        name: 'battery',
        color: 'blue',
        icon: 'item_battery.png'
      },
      {
        title: '光伏支架',
        name: 'Bracket',
        color: 'purple',
        icon: 'item_bracket.png'
      },
      {
        title: '灌溉系统 ',
        name: 'water',
        color: 'mauve',
        icon: 'item_water.png'
      },
    ],
    currentPage: 1,
    pageSize: 50,
    notices: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  attached: function(options) {

  },
  methods: {
    cardSwiper(e) {
      this.setData({
        cardCur: e.detail.current
      })
    },
    swiperChange: function(e) {
      let that = this;
      that.setData({
        "swiperIndex": e.detail.current,
      })
    },

    urlTap: function(option) {
      let url = option.currentTarget.dataset.url;
      wx.navigateTo({
        url: '../web/web?url=' + url,
      })
    },
  },
})