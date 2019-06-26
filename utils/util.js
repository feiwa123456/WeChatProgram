const formatTime = date =>
{
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n =>
{
    n = n.toString()
    return n[1] ? n : '0' + n
}

module.exports = {
    formatTime: formatTime
}
// util.js
//时间戳转换成日期时间


function dateTime(value) {

  var val = value.toString();
  var date = new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10));


  //月份为0-11，所以+1，月份小于10时补个0
  var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;


  var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();


  var hour = date.getHours();


  var minute = date.getMinutes();


  var second = date.getSeconds();


  var theTime = date.getFullYear() + "-" + month + "-" + currentDate + " " + hour + ":" + minute + ":" + second;

  return theTime;


}
module.exports = {


  dateTime: dateTime


}
