const App = getApp();

Page({


  /**
   * 页面的初始数据
   */
  data: {

    // 门店详情
    detail: {},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    // 获取门店详情
    _this.getShopDetail(options.shop_id);
  },

  /**
   * 获取门店详情
   */
  getShopDetail(shop_id) {
    let _this = this;
    App._get('shop/detail', {
      shop_id
    }, function(result) {
      _this.setData(result.data);
    });
  },

  /**
   * 拨打电话
   */
  onMakePhoneCall() {
    let _this = this;
    wx.makePhoneCall({
      phoneNumber: _this.data.detail.phone
    });
  },

  /**
   * 查看位置
   */
  onOpenLocation() {
    let _this = this,
      detail = _this.data.detail;
    wx.openLocation({
      name: detail.shop_name,
      address: detail.region.province + detail.region.city + detail.region.region + detail.address,
      longitude: Number(detail.longitude),
      latitude: Number(detail.latitude),
      scale: 15
    });
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    const _this = this;
    // 构建页面参数
    const params = App.getShareUrlParams({
      'shop_id': _this.data.detail.shop_id
    });
    return {
      title: _this.data.detail.article_title,
      path: "/pages/shop/detail/index?" + params
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
    const params = App.getShareUrlParams({
      'shop_id': _this.data.detail.shop_id
    });
    return {
      title: _this.data.detail.article_title,
      path: "/pages/shop/detail/index?" + params
    };
  },

})