const App = getApp();

// 富文本插件
import wxParse from '../../../wxParse/wxParse.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 文章详情
    detail: {},

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取文章详情
    this.getArticleDetail(options.article_id);
  },

  /**
   * 获取文章详情
   */
  getArticleDetail(article_id) {
    let _this = this;
    App._get('article/detail', {
      article_id
    }, function (result) {
      let detail = result.data.detail;
      // 富文本转码
      if (detail.article_content.length > 0) {
        wxParse.wxParse('content', 'html', detail.article_content, _this, 0);
      }
      _this.setData({
        detail
      });
    });
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    // 构建页面参数
    const params = App.getShareUrlParams({
      'article_id': this.data.detail.article_id
    });
    return {
      title: this.data.detail.article_title,
      path: "/pages/article/detail/index?" + params
    };
  },

  /**
   * 分享到朋友圈
   * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
   * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
   */
  onShareTimeline() {
    // 构建页面参数
    const params = App.getShareUrlParams({
      'article_id': this.data.detail.article_id
    });
    return {
      // title: this.data.detail.article_title,
      path: "/pages/article/detail/index?" + params
    };
  }

})