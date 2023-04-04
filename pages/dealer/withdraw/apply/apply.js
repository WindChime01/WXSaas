const App = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isData: false,

    words: {},
    payment: 20,

    submsgSetting: {}, // 订阅消息配置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    // 获取订阅消息配置
    _this.getSubmsgSetting();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let _this = this;
    // 获取分销商提现信息
    _this.getDealerWithdraw();
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
   * 获取分销商提现信息
   */
  getDealerWithdraw() {
    let _this = this;
    App._get('user.dealer/withdraw', {}, (result) => {
      let data = result.data;
      data.isData = true;
      // 设置当前页面标题
      wx.setNavigationBarTitle({
        title: data.words.withdraw_apply.title.value
      });
      //  默认提现方式
      data['payment'] = data.settlement.pay_type[0];
      _this.setData(data);
    });
  },

  /**
   * 提交申请 
   */
  onFormSubmit(e) {
    let _this = this,
      values = e.detail.value,
      words = _this.data.words.withdraw_apply.words;

    // 验证可提现佣金
    if (_this.data.dealer.money <= 0) {
      App.showError('当前没有' + words.capital.value);
      return false;
    }
    // 验证提现金额
    if (!values.money || values.money.length < 1) {
      App.showError('请填写' + words.money.value);
      return false;
    }
    // 按钮禁用
    _this.setData({
      disabled: true
    });
    // 提现方式
    values['pay_type'] = _this.data.payment;

    // 数据提交
    const onCallback = () => {
      App._post_form('user.dealer.withdraw/submit', {
        data: JSON.stringify(values)
      }, (result) => {
        // 提交成功
        App.showError(result.msg, () => {
          wx.navigateTo({
            url: '../list/list',
          })
        });
      }, null, () => {
        // 解除按钮禁用
        _this.setData({
          disabled: false
        });
      });
    };
    // 确认是否提交
    wx.showModal({
      // title: '友情提示',
      content: '确定提交提现申请吗？请确认填写无误',
      showCancel: true,
      success(res) {
        if (res.confirm) {
          // 请求用户订阅消息
          _this._onRequestSubscribeMessage(onCallback);
        } else if (res.cancel) {
          // 解除按钮禁用
          _this.setData({
            disabled: false
          });
        }
      }
    });
  },

  /**
   * 订阅消息 => [提现通知]
   */
  _onRequestSubscribeMessage(callback) {
    let _this = this,
      tmplIds = [],
      dealerSubmsg = _this.data.submsgSetting.dealer;
    dealerSubmsg.withdraw_01.template_id != '' && tmplIds.push(dealerSubmsg.withdraw_01.template_id);
    dealerSubmsg.withdraw_02.template_id != '' && tmplIds.push(dealerSubmsg.withdraw_02.template_id);

    if (tmplIds.length == 0) {
      callback && callback();
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds,
      success(res) {},
      fail(res) {},
      complete(res) {
        callback && callback();
      },
    });
  },

  /**
   * 切换提现方式
   */
  toggleChecked(e) {
    let _this = this;
    _this.setData({
      payment: e.currentTarget.dataset.payment
    });
  },

})