var app = new Vue({
    el: '#app',
    data: {
        textarea: { // 参与列表文本域
            value: '', // v-model 绑定值
            placeholder: '', // 初始化时从 example 中随机获取一种
            example: [
                "麻辣香锅\n担担面\n黄焖鸡米饭\n过桥米线\n麻辣烫\n泡面",
                "饥荒\nKingdom Rush\n红色警戒\n魔兽争霸\n超级玛丽\n植物大战僵尸",
                "火龙果\n香蕉\n橙子\n牛油果\n百香果\n芒果",
                "斗地主\n麻将\n中国象棋\n五子棋\n黑白棋\n军旗",
                "长笛\n架子鼓\n大提琴\n钢琴\n双排键\n手风琴",
            ],
        },
        settings: { // 设置相关
            page_title: 'Cubing师大抽奖系统', // 页面标题，
            visible: false, // 设置面板默认隐藏
            logo_show: true, // logo 默认显示
            logo_path: 'https://avatars.githubusercontent.com/u/31869999',
            rolling_interval: 40,
            form: {
                // form 中均为 v-model 绑定值，设置面板中的表单，保存时覆盖 settings 值
                page_title: '',
                // tab: link | upload | hidden
                logo_tab: 'upload',
                // 当 logo_tab == link 时使用
                url_logo_path: '',
                // 当 logo_tab == upload 时使用
                upload_logo_path: '',
                rolling_interval: 0,
            },
        },
        rolling: {
            reminder: [], // 剩余参与者
            started: false, // 抽奖状态
            status: false, // 滚动状态
            content: '点击下方按钮抽奖', // 滚动栏内容
            btn_msg: '抽 奖',
        },
        filling: {
            status: false,
            start: null,
            end: null,
        },
        timer: null,
        lucky_dog: null,
        winners: [],
    },
    mounted: function(){
        // 初始化随机范例
        random = Math.floor(Math.random() * this.textarea.example.length);
        this.textarea.placeholder = this.textarea.example[random];

        // 初始化页面标题
        document.title = this.settings.form.page_title;
        this.settings.form.page_title = this.settings.page_title;
        this.settings.form.rolling_interval = this.settings.rolling_interval;
        // 初始化 logo
        this.settings.form.url_logo_path = '';
        this.settings.form.upload_logo_path = this.settings.logo_path;
    },
    methods: {
        /*
         * 打开或关闭设置窗口
         */
        toggle_settings: function () {
            this.settings.visible = !this.settings.visible;
        },

        /*
        * 刷新 logo 显示或隐藏
        */
        refresh_logo: function () {
            if (this.settings.form.logo_tab == 'link') {
                this.settings.logo_show = true;
                this.settings.logo_path = this.settings.form.url_logo_path;
            } else if (this.settings.form.logo_tab == 'upload') {
                this.settings.logo_show = true;
                this.settings.logo_path = this.settings.form.upload_logo_path;
            } else if (this.settings.form.logo_tab == 'hidden') {
                this.settings.logo_show = false;
            }
        },
        /*
         * 开始或停止抽奖
         */
        toggle_rolling: function() {
            // 抽奖已经结束了
            if (this.rolling.started) {
                if (this.rolling.reminder.length === 0) {
                    this.rolling.content = '全部抽完啦~';
                    this.rolling.btn_msg = '抽...抽不动了';
                    return;
                }
            } else {
                if (!this.textarea.value || this.player_list.length === 0) {
                    return;
                }
            }
            this.rolling.started = true; // 进入抽奖状态
            this.rolling.status = !this.rolling.status; // 进入滚动状态
            if (this.rolling.status) {
                this._rolling_start();
            } else {
                this._rolling_stop();
                // 将幸运儿从余参与者中移除
                this.winners.push(this.rolling.reminder[this.lucky_dog]);
                this.rolling.reminder.splice(this.lucky_dog, 1);
            }
        },
        _rolling_start: function() {
            // 抽奖中
            this.rolling.btn_msg = '停!';
            // 启用定时器，随机显示参与者
            this.timer = setInterval(this._change_name, this.settings.rolling_interval);
        },
        _rolling_stop: function() {
            // 停止抽奖
            this.rolling.btn_msg = '抽 奖';
            // 关闭定时器，结束抽奖
            clearInterval(this.timer);
        },
        _change_name: function() {
            this.lucky_dog = Math.floor(Math.random() * this.rolling.reminder.length);
            this.rolling.content = this.rolling.reminder[this.lucky_dog];
        },
        /* 上传 logo */
        upload_logo: function(event) {
            let that = this
            if (window.FileReader) {
                let reader = new FileReader();
                reader.readAsDataURL(event.target.files[0]);
                reader.onloadend = function(e) {
                    that.settings.form.upload_logo_path = e.target.result;
                };
            }
        },
        /* 快捷填充，只能填数字 */
        fill: function() {
            this.filling.status = true; // 开始填充
            this.textarea.value = ''; // 置空输入框

            var begin = !isNaN(this.filling.start) ? this.filling.start : 0;
            var end = !isNaN(this.filling.end) ? this.filling.end : 0;

            //填充输入框
            if (begin <= end) {
                this.textarea.value += begin;
                for (var i = begin + 1; i <= end; i++) {
                    this.textarea.value += '\n' + i;
                }
            }

            this.filling.status = false; //填充结束
        },
        save_settings: function() {
            document.title = this.settings.form.page_title; // 更新页面标题
            this.settings.page_title = this.settings.form.page_title;
            this.refresh_logo();
            this.settings.rolling_interval = this.settings.form.rolling_interval;
            this.settings.visible = false;
        },
        restart: function () {
            this._rolling_stop();
            this.rolling.started = false;
            this.rolling.status = false;
            this.winners = [];
            this.rolling.reminder = [];
            this.rolling.content = '点击下方按钮抽奖';
        },
        /* 切换设置中的 logo 分栏 */
        _switch_settings_logo_tab: function(tab) {
            this.settings.form.logo_tab = tab;
            console.log(this.settings.form.logo_tab)
        },
    },
    computed: {
        /* 参与列表 */
        player_list: function () {
            list = this.textarea.value.split('\n'); // 按行分割
            list = list.filter(function (str) {
                return str && str.trim(); // 去除空值
            });
            list = Array.from(new Set(list)); // 去重

            // 初始化可抽奖的参与名单
            if (!this.rolling.started) {
                this.rolling.reminder = list;
                console.log('初始化可抽奖的参与名单');
            }
            return list;
        },
    }

});