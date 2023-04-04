const App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyStatus: [],
    dataType: -1,

    submsgSetting: {}, // 订阅消息配置

    list: [], // 列表数据
    page: 1, // 当前页码
    isLoading: true, // 是否正在加载中
    isLastPage: false, // 当前是最后一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    // 设置swiper的高度
    _this.setSwiperHeight();
    // 获取订阅消息配置
    _this.getSubmsgSetting();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let _this = this;
    // 获取退款/售后单列表
    _this.getRefundList();
  },

  /**
   * 获取退款/售后单列表
   */
  getRefundList(isNextPage, page) {
    let _this = this;
    App._get('sharing.refund/lists', {
      state: _this.data.dataType,
      page: page || 1,
    }, (result) => {
      // 创建页面数据
      _this.setData(_this.createData(result.data, isNextPage));
    });
  },

  /**
   * 获取订阅消息配置
   */
  getSubmsgSetting() {
    let _this = this;
    App._get('wxapp.submsg/setting', {}, (result) => {
      _this.setData({
        submsgSetting: result.data.setting
      });
    });
  },

  /**
   * 创建页面数据
   */
  createData(data, isNextPage) {
    data['isLoading'] = false;
    // 列表数据
    let dataList = this.data.list;
    if (isNextPage == true && (typeof dataList !== 'undefined')) {
      data.list.data = dataList.data.concat(data.list.data)
    }
    // 导航栏数据
    data['tabList'] = [{
      value: -1,
      text: '全部'
    }, {
      value: 0,
      text: '待处理'
    }];
    return data;
  },

  /**
   * 设置swiper的高度
   */
  setSwiperHeight() {
    // 获取系统信息(拿到屏幕宽度)
    let systemInfo = wx.getSystemInfoSync(),
      rpx = systemInfo.windowWidth / 750, // 计算rpx
      tapHeight = Math.floor(rpx * 82), // tap高度
      swiperHeight = systemInfo.windowHeight - tapHeight; // swiper高度
    this.setData({
      swiperHeight
    });
  },

  /** 
   * 点击tab切换 
   */
  swichNav(e) {
    let _this = this,
      current = e.target.dataset.current;
    if (_this.data.dataType == current) {
      return false;
    }
    _this.setData({
      dataType: current,
      list: {},
      page: 1,
      isLastPage: false,
      isLoading: true,
    }, () => {
      // 获取退款/售后单列表
      _this.getRefundList();
    });
  },

  /**
   * 下拉到底加载数据
   */
  onPageDown() {
    let _this = this;
    // 已经是最后一页
    if (_this.data.page >= _this.data.list.last_page) {
      _this.setData({
        isLastPage: true
      });
      return false;
    }
    // 获取退款/售后单列表
    _this.getRefundList(true, ++_this.data.page);
  },

  /**
   * 跳转售后详情页
   */
  onTargetDetail(e) {
    let _this = this;
    // 跳转售后详情页
    const onCallback = () => {
      wx.navigateTo({
        url: `./detail/detail?order_refund_id=${e.currentTarget.dataset.id}`
      });
    };
    // 请求用户订阅消息
    _this._onRequestSubscribeMessage(onCallback);
  },

  /**
   * 订阅消息 => [售后状态通知]
   */
  _onRequestSubscribeMessage(callback) {
    let _this = this;
    let tmplItem = _this.data.submsgSetting.order.refund.template_id;

    if (tmplItem.length == 0) {
      callback && callback();
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: [tmplItem],
      success(res) {},
      fail(res) {},
      complete(res) {
        callback && callback();
      },
    });
  },

})