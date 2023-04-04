import wxParse from '../../../wxParse/wxParse.js';
import util from '../../../utils/util.js';
import ActiveStatusEnum from '../../../utils/enum/sharp/GoodsStatus.js';

const App = getApp();

// 记录规格的数组
let goodsSpecArr = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {

    indicatorDots: true, // 是否显示面板指示点
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    duration: 800, // 滑动动画时长

    currentIndex: 1, // 轮播图指针
    floorstatus: false, // 返回顶部

    seckill_price: 0, // 商品价格
    original_price: 0, // 商品原价
    seckill_stock: 0, // 库存数量

    goods_num: 1, // 商品数量
    goods_sku_id: 0, // 规格id
    cart_total_num: 0, // 购物车商品总数量
    goodsMultiSpec: {}, // 多规格信息

    ActiveStatusEnum, // 秒杀活动商品状态

    // 分享按钮组件
    share: {
      show: false,
      cancelWithMask: true,
      cancelText: '关闭',
      actions: [{
        name: '生成商品海报',
        className: 'action-class',
        loading: false
      }, {
        name: '发送给朋友',
        openType: 'share'
      }],
      // 商品海报
      showPopup: false,
    },

    // 返回顶部
    showTopWidget: false,

    active: {}, // 秒杀活动详情
    goods: {}, // 商品详情

    countDownTime: false // 倒计时

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const _this = this,
      scene = App.getSceneData(options);
    // 秒杀商品id
    _this.setData({
      active_time_id: options.active_time_id ? options.active_time_id : scene.aid,
      sharp_goods_id: options.sharp_goods_id ? options.sharp_goods_id : scene.gid,
    });
    // 获取秒杀商品信息
    _this.onRefreshPage();
  },

  /**
   * 刷新页面数据
   */
  onRefreshPage() {
    // 获取秒杀商品信息
    const _this = this
    _this.getActiveDetail()
  },

  /**
   * 获取秒杀商品信息
   */
  getActiveDetail() {
    let _this = this;
    App._get('sharp.goods/detail', {
      active_time_id: _this.data.active_time_id,
      sharp_goods_id: _this.data.sharp_goods_id,
    }, (result) => {
      const data = result.data
      // 初始化详情数据
      _this._initData(data);
      // 初始化倒计时组件
      _this._initCountDownData(data);
    })
  },

  /**
   * 初始化详情数据
   */
  _initData(data) {
    let _this = this;
    // 商品详情
    let goodsDetail = data.goods;
    // 富文本转码
    if (goodsDetail.content.length > 0) {
      wxParse.wxParse('content', 'html', goodsDetail.content, _this, 0);
    }
    // 商品价格/划线价/库存
    data.goods_sku_id = goodsDetail.goods_sku.spec_sku_id;
    data.seckill_price = goodsDetail.goods_sku.seckill_price;
    data.original_price = goodsDetail.goods_sku.original_price;
    data.seckill_stock = goodsDetail.goods_sku.seckill_stock;
    // 商品封面图(确认弹窗)
    data.skuCoverImage = goodsDetail.goods_image;
    // 多规格商品封面图(确认弹窗)
    if (goodsDetail.spec_type == 20 && goodsDetail.goods_sku['image']) {
      data.skuCoverImage = goodsDetail.goods_sku['image']['file_path'];
    }
    // 初始化商品多规格
    if (goodsDetail.spec_type == 20) {
      data.goodsMultiSpec = _this._initManySpecData(goodsDetail.goods_multi_spec);
    }
    _this.setData(data)
  },

  /**
   * 初始化倒计时组件
   */
  _initCountDownData(data) {
    const app = this
    // 记录倒计时的时间
    const countDownTime = data.active.active_status == ActiveStatusEnum.STATE_SOON.value ?
      data.active.start_time : data.active.end_time
    app.setData({
      countDownTime
    })
  },

  /**
   * 初始化商品多规格
   */
  _initManySpecData(data) {
    goodsSpecArr = [];
    for (let i in data.spec_attr) {
      for (let j in data.spec_attr[i].spec_items) {
        if (j < 1) {
          data.spec_attr[i].spec_items[0].checked = true;
          goodsSpecArr[i] = data.spec_attr[i].spec_items[0].item_id;
        }
      }
    }
    return data;
  },

  // 倒计时结束刷新页面
  onCountDownEnd() {
    const app = this
    console.log('onCountDownEnd')
    setTimeout(() => {
      app.onRefreshPage()
    }, 200)
  },

  /**
   * 点击切换不同规格
   */
  onSwitchSpec(e) {
    let _this = this,
      attrIdx = e.currentTarget.dataset.attrIdx,
      itemIdx = e.currentTarget.dataset.itemIdx,
      goodsMultiSpec = _this.data.goodsMultiSpec;
    for (let i in goodsMultiSpec.spec_attr) {
      for (let j in goodsMultiSpec.spec_attr[i].spec_items) {
        if (attrIdx == i) {
          goodsMultiSpec.spec_attr[i].spec_items[j].checked = false;
          if (itemIdx == j) {
            goodsMultiSpec.spec_attr[i].spec_items[itemIdx].checked = true;
            goodsSpecArr[i] = goodsMultiSpec.spec_attr[i].spec_items[itemIdx].item_id;
          }
        }
      }
    }
    _this.setData({
      goodsMultiSpec
    });
    // 更新商品规格信息
    _this._updateSpecGoods();
  },

  /**
   * 更新商品规格信息
   */
  _updateSpecGoods() {
    let _this = this,
      specSkuId = goodsSpecArr.join('_');
    // 查找skuItem
    let spec_list = _this.data.goodsMultiSpec.spec_list,
      skuItem = spec_list.find((val) => {
        return val.spec_sku_id == specSkuId;
      });
    // 记录goods_sku_id
    // 更新商品价格、划线价、库存
    if (typeof skuItem === 'object') {
      _this.setData({
        goods_sku_id: skuItem.spec_sku_id,
        seckill_price: skuItem.form.seckill_price,
        original_price: skuItem.form.original_price,
        seckill_stock: skuItem.form.seckill_stock,
        skuCoverImage: skuItem.form.image_id > 0 ? skuItem.form.image_path : _this.data.goods.goods_image
      });
    }
  },

  /**
   * 设置轮播图当前指针 数字
   */
  setCurrent(e) {
    let _this = this;
    _this.setData({
      currentIndex: e.detail.current + 1
    });
  },

  /**
   * 浏览商品图片
   */
  onPreviewImages(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index,
      imageUrls = [];
    _this.data.goods.image.forEach(item => {
      imageUrls.push(item.file_path);
    });
    wx.previewImage({
      current: imageUrls[index],
      urls: imageUrls
    })
  },

  /**
   * 预览Sku规格图片
   */
  onPreviewSkuImage(e) {
    let _this = this;
    wx.previewImage({
      current: _this.data.skuCoverImage,
      urls: [_this.data.skuCoverImage]
    })
  },

  /**
   * 跳转到评论
   */
  onTargetToComment() {
    let _this = this;
    wx.navigateTo({
      url: `../../goods/comment/comment?goods_id=${_this.data.goods.goods_id}`
    });
  },

  /**
   * 返回顶部
   */
  onScrollTop(t) {
    let _this = this;
    _this.setData({
      scrollTop: 0
    });
  },

  /**
   * 显示/隐藏 返回顶部按钮
   */
  onScrollEvent(e) {
    let _this = this;
    _this.setData({
      showTopWidget: e.detail.scrollTop > 200
    })
  },

  /**
   * 显示分享选项
   */
  onClickShare(e) {
    let _this = this;
    _this.setData({
      'share.show': true
    });
  },

  /**
   * 关闭分享选项
   */
  onCloseShare() {
    let _this = this;
    _this.setData({
      'share.show': false
    });
  },

  /**
   * 点击生成商品海报
   */
  onClickShareItem(e) {
    let _this = this;
    if (e.detail.index === 0) {
      // 显示商品海报
      _this._showPoster();
    }
    _this.onCloseShare();
  },

  /**
   * 切换商品海报
   */
  onTogglePopup() {
    let _this = this;
    _this.setData({
      'share.showPopup': !_this.data.share.showPopup
    });
  },

  /**
   * 显示商品海报图
   */
  _showPoster() {
    let _this = this;
    wx.showLoading({
      title: '加载中',
    });
    App._get('sharp.goods/poster', {
      active_time_id: _this.data.active_time_id,
      sharp_goods_id: _this.data.sharp_goods_id,
    }, (result) => {
      _this.setData(result.data, () => {
        _this.onTogglePopup();
      });
    }, null, () => {
      wx.hideLoading();
    });
  },

  /**
   * 保存海报图片
   */
  onSavePoster(e) {
    let _this = this;
    wx.showLoading({
      title: '加载中',
    });
    // 下载海报图片
    wx.downloadFile({
      url: _this.data.qrcode,
      success(res) {
        wx.hideLoading();
        // 图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            // 关闭商品海报
            _this.onTogglePopup();
          },
          fail(err) {
            console.log(err.errMsg);
            if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
              wx.showToast({
                title: "请允许访问相册后重试",
                icon: "none",
                duration: 1000
              });
              setTimeout(() => {
                wx.openSetting();
              }, 1000);
            }
          },
          complete(res) {
            console.log('complete');
            // wx.hideLoading();
          }
        })
      }
    })
  },

  /**
   * 增加商品数量
   */
  onIncGoodsNumber(e) {
    let _this = this;
    _this.setData({
      goods_num: ++_this.data.goods_num
    })
  },

  /**
   * 减少商品数量
   */
  onDecGoodsNumber(e) {
    let _this = this;
    if (_this.data.goods_num > 1) {
      _this.setData({
        goods_num: --_this.data.goods_num
      });
    }
  },

  /**
   * 自定义输入商品数量
   */
  onInputGoodsNum(e) {
    let _this = this,
      iptValue = e.detail.value;
    if (!util.isPositiveInteger(iptValue) && iptValue !== '') {
      iptValue = 1;
    }
    _this.setData({
      goods_num: iptValue
    });
  },

  /**
   * 确认购买弹窗
   */
  onToggleTrade() {
    let _this = this;
    _this.setData({
      showBottomPopup: !_this.data.showBottomPopup
    });
  },

  /**
   * 确认购买
   */
  onCheckout(e) {
    let _this = this;
    // 表单验证
    if (!_this._onVerify()) {
      return false;
    }
    // 立即购买
    wx.navigateTo({
      url: '../../flow/checkout?' + util.urlEncode({
        order_type: 'sharp',
        active_time_id: _this.data.active_time_id,
        sharp_goods_id: _this.data.sharp_goods_id,
        goods_sku_id: _this.data.goods_sku_id,
        goods_num: _this.data.goods_num,
      }),
      success() {
        // 关闭弹窗
        _this.onToggleTrade();
      }
    });
  },

  /**
   * 表单验证
   */
  _onVerify() {
    let _this = this;
    if (_this.data.goods_num === '') {
      App.showError('请输入购买数量');
      return false;
    }
    // 将购买数量转为整型，防止出错
    _this.setData({
      goods_num: parseInt(_this.data.goods_num)
    });
    if (_this.data.goods_num <= 0) {
      App.showError('购买数量不能为0');
      return false;
    }
    // 判断限购数量
    return true;
  },

  /**
   * 跳转到首页
   */
  onTargetHome(e) {
    wx.switchTab({
      url: '../../index/index',
    })
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    const _this = this;
    // 构建页面参数
    const params = App.getShareUrlParams({
      active_time_id: _this.data.active_time_id,
      sharp_goods_id: _this.data.sharp_goods_id,
    });
    return {
      title: _this.data.goods.goods_name,
      path: `/pages/sharp/goods/index?${params}`
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
      active_time_id: _this.data.active_time_id,
      sharp_goods_id: _this.data.sharp_goods_id,
    });
    return {
      title: _this.data.goods.goods_name,
      path: `/pages/sharp/goods/index?${params}`
    };
  },

})