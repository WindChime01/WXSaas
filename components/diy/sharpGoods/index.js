import util from '../../../utils/util.js';
import ActiveStatusEnum from '../../../utils/enum/sharp/GoodsStatus.js';

const App = getApp()

Component({

  options: {
    addGlobalClass: true,
  },

  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    itemIndex: String,
    itemStyle: Object,
    params: Object,
    data: Object,
  },

  /**
   * 组件私有属性
   */
  data: {
    ActiveStatusEnum, // 秒杀活动商品状态
    countDownTime: false, // 倒计时日期
  },

  /**
   * 组件生命周期声明对象
   */
  lifetimes: {

    /**
     * 在组件实例进入页面节点树时执行
     */
    attached() {
      let _this = this;
      _this._initCountDownData();
    }

  },



  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {

    /**
     * 跳转商品详情页
     */
    _onTargetGoods(e) {
      // 生成query参数
      let _this = this,
        query = util.urlEncode({
          active_time_id: _this.data.data.active.active_time_id,
          sharp_goods_id: e.detail.target.dataset.id,
        });
      // 跳转到商品详情页
      wx.navigateTo({
        url: `/pages/sharp/goods/index?${query}`,
      });
    },

    /**
     * 更多秒杀
     */
    _onTargetSharpIndex(e) {
      // 跳转到秒杀会场首页
      wx.navigateTo({
        url: `/pages/sharp/index/index`,
      });
    },

    /**
     * 初始化倒计时组件
     */
    _initCountDownData() {
      const app = this
      const active = app.data.data.active
      if (!active) return false;
      // 记录倒计时的时间
      app.setData({
        countDownTime: active.count_down_time
      })
    }
  }

})