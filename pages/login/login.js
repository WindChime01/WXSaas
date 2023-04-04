const App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    _this.setData({
      options
    });
  },

  /**
   * 授权登录（旧版弃用）
   */
  getUserInfo(e) {
    let _this = this;
    App.getUserInfo(e, () => {
      // 跳转回原页面
      _this.onNavigateBack(1);
    });
  },

  /**
   * 授权登录（新版）
   */
  getUserProfile() {
    console.log('getUserProfile')
    const app = this
    wx.canIUse('getUserProfile') && wx.getUserProfile({
      lang: 'zh_CN',
      desc: '获取用户相关信息',
      success({
        userInfo
      }) {
        console.log('用户同意了授权')
        console.log('userInfo：', userInfo)
        App.getUserInfo(userInfo, () => {
          // 跳转回原页面
          app.onNavigateBack(1)
        });
      },
      fail() {
        console.log('用户拒绝了授权')
      }
    })
  },

  /**
   * 暂不登录
   */
  onNotLogin() {
    let _this = this;
    // 跳转回原页面
    _this.onNavigateBack(_this.data.options.delta);
  },

  /**
   * 授权成功 跳转回原页面
   */
  onNavigateBack(delta) {
    wx.navigateBack({
      delta: Number(delta || 1)
    });
  },

})