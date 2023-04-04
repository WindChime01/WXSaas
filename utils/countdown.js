// 工具类
import util from './util.js';

/**
 * 倒计时类
 */
module.exports = {

  // 计时器句柄
  countIds: {},

  start(countId, app, dataIndex, endCallBack) {
    // console.log('start')
    this.onSetTimeList(countId, app, dataIndex, endCallBack, 0)
  },

  onSetTimeList(countId, app, dataIndex, endCallBack, deep = 0) {
    const _this = this;
    // 获取倒计时数据对象
    const countDownObj = app.data[dataIndex]
    // 获取当前时间，同时得到活动结束时间数组
    const newTime = new Date().getTime()
    // 对结束时间进行处理渲染到页面
    const endTime = new Date(util.format_date(countDownObj.date)).getTime();
    // 初始化倒计时数据
    countDownObj.dynamic = {
      // day: '00',
      hou: '00',
      min: '00',
      sec: '00'
    };
    // 如果活动未结束，对时间进行处理
    if (endTime - newTime > 0) {
      const diffTime = (endTime - newTime) / 1000;
      // 获取时、分、秒
      // day = parseInt(diffTime / 86400),
      const hou = parseInt(diffTime / 3600),
        min = parseInt(diffTime % 3600 / 60),
        sec = parseInt(diffTime % 3600 % 60);
      countDownObj.dynamic.hou = _this.timeFormat(hou)
      countDownObj.dynamic.min = _this.timeFormat(min)
      countDownObj.dynamic.sec = _this.timeFormat(sec)
    }

    // 渲染，然后每隔一秒执行一次倒计时函数
    app.setData({
      [`${dataIndex}`]: countDownObj
    })
    // 判断倒计时是否结束
    const isEnd = _this.isEnd(countDownObj);
    // 结束后执行回调函数
    isEnd && deep > 0 && endCallBack && endCallBack();
    // 重复执行
    _this.countIds[countId] && clearTimeout(_this.countIds[countId])
    if (!isEnd) {
      _this.countIds[countId] = setTimeout(() => {
        _this.onSetTimeList(countId, app, dataIndex, endCallBack, ++deep)
      }, 1000)
    }
  },

  /**
   * 判断倒计时是否结束
   * @param {*} countDownObj 
   */
  isEnd(countDownObj) {
    const {
      dynamic
    } = countDownObj
    if (dynamic.hou == '00' && dynamic.min == '00' && dynamic.sec == '00') {
      return true
    }
    return false
  },

  /**
   * 小于10的格式化函数
   */
  timeFormat(param) {
    return param < 10 ? '0' + param : param;
  },


};