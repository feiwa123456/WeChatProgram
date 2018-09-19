//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    swiper:{
      imgUrls: [
        'https://ztn-tech.com/public/static/wechar-resource/carousel/slide0.png',
        'https://ztn-tech.com/public/static/wechar-resource/carousel/slide1.png',
        'https://ztn-tech.com/public/static/wechar-resource/carousel/slide2.png',
        'https://ztn-tech.com/public/static/wechar-resource/carousel/slide3.png',
      ],
      indicatorDots: false,
      autoplay: true,
      interval: 5000,
      duration: 1000,
    },
    images:{
      mode: 'aspectFit',
    },
    search:{
      "type":"text",
      "confirm-type":"search",
      "adjust-position":"fasle",
      "bindconfirm":function(ret){
        console.log(ret);
      }
    },
    itemArr: [
      {
        "url": "",
        "icon": "../../images/item_1.png",
        "text": "太阳能板"
      },
      {
        "url": "",
        "icon": "../../images/item_2.png",
        "text": "储能电池"
      },
      {
        "url": "",
        "icon": "../../images/item_3.png",
        "text": "光伏支架"
      },
      {
        "url": "",
        "icon": "../../images/item_4.png",
        "text": "控制器"
      },
    ]
  },
})


