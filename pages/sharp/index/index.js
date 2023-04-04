import util from '../../../utils/util.js';
import StateEnum from '../../../utils/enum/sharp/ActiveStatus.js';

const App = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 当前tab索引
    curTabIndex: 0,

    noMore: false, // 没有更多数据
    isLoading: true, // 是否正在加载中
    page: 1, // 当前页码

    StateEnum, // 枚举类：秒杀会场活动状态

    countDownTime: false, // 倒计时日期

    // 秒杀活动场次
    tabbar: [],

    // 秒杀商品列表
    goodsList: [],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _this = this;
    _this.onRefreshPage()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // const _this = this;
    // if (_this.data.curTabIndex == 0) {
    //   // 刷新页面
    //   _this.onRefreshPage()
    // }
  },

  /**
   * 刷新页面数据
   */
  onRefreshPage() {
    const _this = this
    return new Promise((resolve, reject) => {
      // 获取列表数据
      _this.getApiData().then(() => {
        resolve()
      })
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // 获取首页数据
    this.onRefreshPage().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 获取页面数据
   */
  getApiData() {
    const app = this;
    return new Promise((resolve, reject) => {
      App._get('sharp.index/index', {}, (result) => {
        const data = result.data
        app.setData(data);
        // 初始化倒计时组件
        app._initCountDownData();
        resolve(data)
      });
    })
  },

  /**
   * 初始化倒计时组件
   */
  _initCountDownData() {
    const app = this,
      curTabbar = app.data.tabbar[app.data.curTabIndex];
    // 记录倒计时的时间
    app.setData({
      countDownTime: curTabbar.count_down_time
    })
  },

  // 倒计时结束刷新页面
  onCountDownEnd() {
    console.log('onCountDownEnd')
    const app = this
    setTimeout(() => {
      app.onRefreshPage()
    }, 200)
  },

  /**
   * 切换tabbar
   */
  onToggleTab(e) {
    let _this = this;
    // 设置当前tabbar索引，并重置数据
    const curTabIndex = e.currentTarget.dataset.index
    _this.setData({
      curTabIndex,
      goodsList: [],
      page: 1,
      isLoading: true,
      noMore: false,
    });
    // 获取列表数据
    _this.getGoodsList();
    // 初始化倒计时组件
    _this._initCountDownData();
  },

  /**
   * 跳转到秒杀商品详情
   */
  onTargetActive(e) {
    let _this = this,
      curTabbar = _this.data.tabbar[_this.data.curTabIndex];
    let query = util.urlEncode({
      active_time_id: curTabbar.active_time_id,
      sharp_goods_id: e.detail.target.dataset.id,
    });
    console.log(query);
    wx.navigateTo({
      url: `../goods/index?${query}`,
    })
  },

  /**
   * 下拉到底部加载下一页
   */
  onReachBottom() {
    let _this = this,
      listData = _this.data.goodsList;
    // 已经是最后一页
    if (_this.data.page >= listData.last_page) {
      _this.setData({
        noMore: true
      });
      return false;
    }
    // 加载下一页列表
    _this.setData({
      page: ++_this.data.page
    });
    _this.getGoodsList(true);
  },

  /**
   * 获取列表数据
   */
  getGoodsList(isNextPage) {
    let _this = this,
      curTabbar = _this.data.tabbar[_this.data.curTabIndex];
    App._get('sharp.goods/lists', {
      page: _this.data.page || 1,
      active_time_id: curTabbar.active_time_id
    }, (result) => {
      let resList = result.data.list,
        dataList = _this.data.goodsList;
      if (isNextPage == true) {
        _this.setData({
          'goodsList.data': dataList.data.concat(resList.data),
          isLoading: false,
        });
      } else {
        _this.setData({
          goodsList: resList,
          isLoading: false,
        });
      }
    });
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    const _this = this;
    // 构建页面参数
    const params = App.getShareUrlParams();
    return {
      title: '整点秒杀',
      path: `/pages/sharp/index/index?${params}`
    };
  },

  /**
   * 分享到朋友圈
   * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
   * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
   */
  onShareTimeline() {
    const _this = this;
    // 构建页面参数
    const params = App.getShareUrlParams();
    return {
      title: '整点秒杀',
      path: `/pages/sharp/index/index?${params}`
    };
  },

})