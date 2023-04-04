import util from '../../utils/util'

Component({
  properties: {
    // useSlot: Boolean,
    // 截止的时间
    date: String,
    // 分隔符, colon为英文冒号，zh为中文
    separator: {
      type: String,
      value: 'zh'
    },
    // 组件样式, text为纯文本，custom为带背景色
    style: {
      type: String,
      value: 'text'
    },
  },

  data: {
    // 倒计时数据
    dynamic: {
      day: '00',
      hou: '00',
      min: '00',
      sec: '00'
    },
    // 分隔符文案
    separatorText: {
      day: '天',
      hou: '时',
      min: '分',
      sec: '秒'
    }
  },

  attached() {
    // 分隔符文案
    this.separatorText()
    // 开始倒计时
    this.onTime()
  },

  detached() {

  },


  methods: {

    // 分隔符文案
    separatorText() {
      const separatorText = this.data.separatorText
      if (this.data.separator === 'colon') {
        separatorText.day = ':'
        separatorText.hou = ':'
        separatorText.min = ':'
        separatorText.sec = ''
      }
      this.setData({
        separatorText
      })
    },

    // 开始倒计时
    onTime(deep = 0) {
      const app = this
      const dynamic = {}

      // 获取当前时间，同时得到活动结束时间数组
      const newTime = new Date().getTime()
      // 对结束时间进行处理渲染到页面
      const endTime = new Date(util.format_date(app.data.date)).getTime();

      // 如果活动未结束，对时间进行处理
      if ((endTime - newTime) <= 0) {
        return false
      }

      const diffTime = (endTime - newTime) / 1000;
      // 获取时、分、秒
      const day = parseInt(diffTime / 86400),
        hou = parseInt(diffTime % 86400 / 3600),
        min = parseInt(diffTime % 86400 % 3600 / 60),
        sec = parseInt(diffTime % 86400 % 3600 % 60);
      dynamic.day = app.timeFormat(day)
      dynamic.hou = app.timeFormat(hou)
      dynamic.min = app.timeFormat(min)
      dynamic.sec = app.timeFormat(sec)

      // 渲染，然后每隔一秒执行一次倒计时函数
      app.setData({
        dynamic
      })
      // 判断倒计时是否结束
      const isEnd = app.isEnd()
      // 结束后执行回调函数
      if (isEnd) {
        deep > 0 && app.triggerEvent('finish')
      }
      // 重复执行
      if (!isEnd) {
        setTimeout(() => {
          app.onTime(++deep)
        }, 1000)
      }
    },

    // 判断倒计时是否结束
    isEnd() {
      const {
        dynamic
      } = this.data
      if (dynamic.day == '00' && dynamic.hou == '00' && dynamic.min == '00' && dynamic.sec == '00') {
        return true
      }
      return false
    },

    /**
     * 小于10的格式化函数
     */
    timeFormat(value) {
      return value < 10 ? '0' + value : value
    }



  }
})