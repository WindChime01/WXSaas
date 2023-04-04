const App = getApp();

// 工具类
import Util from '../../utils/util.js';

// 直播状态
const LiveStatus = {
  101: {
    'name': '直播中',
    'value': 101,
  },
  102: {
    'name': '未开始',
    'value': 102,
  },
  103: {
    'name': '已结束',
    'value': 103,
  },
  104: {
    'name': '禁播',
    'value': 104,
  },
  105: {
    'name': '暂停中',
    'value': 105,
  },
  106: {
    'name': '异常',
    'value': 106,
  },
  107: {
    'name': '已过期',
    'value': 107,
  },
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight: 0,

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
    // 设置列表容器高度
    _this.setListHeight();
    // 获取直播间列表
    _this.getLiveRoomList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 获取直播间列表
   */
  getLiveRoomList(isPage, page) {
    let _this = this;
    App._get('live.room/lists', {
      page: page || 1
    }, result => {
      let resList = result.data.list,
        dataList = _this.data.list;
      if (isPage == true) {
        _this.setData({
          'list.data': dataList.data.concat(resList.data),
          isLoading: false,
        });
      } else {
        _this.setData({
          list: resList,
          isLoading: false,
          isLastPage: false,
        });
      }
      // 刷新直播间状态 (体验不佳, 暂不使用)
      // _this.setLiveStatusText(resList);
    });
  },

  /**
   * 刷新直播间状态
   * mix: 因livePlayer.getLiveStatus接口需要间隔1分钟频率轮询, 用户二次进入时体验不佳, 暂不调用
   */
  setLiveStatusText(list) {

    // 引用直播组件
    const livePlayer = requirePlugin('live-player-plugin');

    let _this = this;
    let startIndex = _this.data.list.data.length - list.data.length;

    list.data.forEach((itm, idx) => {
      let index = startIndex + idx;
      let item = _this.data.list.data[index];
      let dataKey = 'list.data[' + index + ']';
      // 首次获取立马返回直播状态，往后间隔1分钟或更慢的频率去轮询获取直播状态
      livePlayer.getLiveStatus({
          room_id: item['room_id']
        })
        .then(res => {
          // 101: 直播中, 102: 未开始, 103: 已结束, 104: 禁播, 105: 暂停中, 106: 异常，107：已过期 
          let liveStatus = res.liveStatus,
            liveStatusText1 = LiveStatus[liveStatus]['name'],
            liveStatusText2 = liveStatusText1;
          if (liveStatus == 101) {
            liveStatusText1 = '正在直播中';
          } else if (liveStatus == 102) {
            liveStatusText1 = _this.semanticStartTime(item.start_time) + ' 开播';
          }
          _this.setData({
            [dataKey + '.live_status']: liveStatus,
            [dataKey + '.live_status_text_1']: liveStatusText1,
            [dataKey + '.live_status_text_2']: liveStatusText2,
            // test
            // [dataKey + '.test']: `test: ${item['room_id']}`,
          });
          console.log(`getLiveStatus: ${item['room_id']}`);
        })
        .catch(err => {
          console.log(`getLiveStatus: ${item['room_id']}`);
        });
    });
    return list;
  },

  /**
   * 语义化开播时间
   */
  semanticStartTime(startTime) {
    // 转换为 YYYYMMDD 格式
    let startTimeObj = new Date(Util.format_date(startTime));
    let $startDate = Util.dateFormat("YYYYmmdd", startTimeObj);
    // 获取今天的 YYYY-MM-DD 格式
    let $todyDate = Util.dateFormat("YYYYmmdd", new Date());
    // 获取明天的 YYYY-MM-DD 格式
    var tomorrowTimeObj = new Date();
    tomorrowTimeObj.setTime(tomorrowTimeObj.getTime() + 24 * 60 * 60 * 1000);
    let $tomorrowDate = Util.dateFormat("YYYYmmdd", tomorrowTimeObj);
    // 使用IF当作字符串判断是否相等
    if ($startDate == $todyDate) {
      return Util.dateFormat('今天HH:MM', startTimeObj);
    } else if ($startDate == $tomorrowDate) {
      return Util.dateFormat('明天HH:MM', startTimeObj);
    }
    // 常规日期格式
    return Util.dateFormat('mm/dd HH:MM', startTimeObj);
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
    // 加载下一页列表
    _this.getLiveRoomList(true, ++_this.data.page);
  },

  /**
   * 设置列表容器高度
   */
  setListHeight() {
    let _this = this,
      systemInfo = wx.getSystemInfoSync();
    _this.setData({
      scrollHeight: systemInfo.windowHeight * 0.98
    });
  },

  /**
   * 进入直播间
   */
  onTargetLiveRoomIndex(e) {
    let roomId = e.currentTarget.dataset.id;
    let customParams = {
      path: 'pages/index/index',
      referee_id: App.getUserId(), // 分销推荐人
    };
    wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${encodeURIComponent(JSON.stringify(customParams))}`
    });
  },

  /**
   * 分享当前页面
   */
  onShareAppMessage() {
    return {
      title: '直播列表',
      path: "/pages/live/index?" + App.getShareUrlParams()
    };
  },

  /**
   * 分享到朋友圈
   * 本接口为 Beta 版本，暂只在 Android 平台支持，详见分享到朋友圈 (Beta)
   * https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html
   */
  onShareTimeline() {
    return {
      title: '直播列表',
      path: "/pages/live/index?" + App.getShareUrlParams()
    };
  },

})