var app = new Vue({
    el: '#app',
    data: {
        textarea: {
            value: '',
            placeholder: '',
            example: [
                "麻辣香锅\n担担面\n黄焖鸡米饭\n过桥米线\n麻辣烫\n泡面",
                "饥荒\nKingdom Rush\n红色警戒\n魔兽争霸\n超级玛丽\n植物大战僵尸",
                "火龙果\n香蕉\n橙子\n牛油果\n百香果\n芒果",
                "斗地主\n麻将\n中国象棋\n五子棋\n黑白棋\n军旗",
                "长笛\n架子鼓\n大提琴\n钢琴\n双排键\n手风琴",
            ],
        },
        settings: {
            page_title: 'Cubing师大抽奖系统',
            visible: false,
            form: {
                page_title: '',
            }
        },
        rolling: {
            reminder: [], // 剩余参与者
            started: false, // 抽奖已经开始，禁用输入框
            status: false, // 正在滚动
            content: '点击下方按钮抽奖',
            btn: {
                msg: '抽 奖',
            },
        },
        filling: {
            status: false,
            start: 1,
            end: 20,
        },
        timer: null,
        lucky_dog: null,
        winners: [],
    },
    mounted: function(){
        // 初始化随机范例
        random = Math.floor(Math.random() * this.textarea.example.length);
        this.textarea.placeholder = this.textarea.example[random];
        console.log('初始化随机范例完成');
        // 初始化标题名称
        this.settings.form.page_title = this.settings.page_title;
        console.log('初始化设置完成');
    },
    methods: {
        /*
         * 打开或关闭设置窗口
         */
        toggle_settings: function () {
            this.settings.visible = !this.settings.visible;
        },

        /*
         * 开始或停止抽奖
         */
        toggle_rolling: function() {
            // 抽奖已经结束了
            if (this.rolling.started) {
                if (this.rolling.reminder.length === 0) {
                    this.rolling.content = '全部抽完啦~';
                    this.rolling.btn.msg = '抽...抽不动了';
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
                // 抽奖中
                this.rolling.btn.msg = '停!';
                // 启用定时器，随机显示参与者
                this.timer = setInterval(this._change_name, 40);
            } else {
                // 停止抽奖
                this.rolling.btn.msg = '抽 奖';
                // 关闭定时器，结束抽奖
                clearInterval(this.timer);
                // 将幸运儿从余参与者中移除
                this.winners.push(this.rolling.reminder[this.lucky_dog]);
                this.rolling.reminder.splice(this.lucky_dog, 1);
            }
        },
        _change_name: function() {
            this.lucky_dog = Math.floor(Math.random() * this.rolling.reminder.length);
            this.rolling.content = this.rolling.reminder[this.lucky_dog];
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
            // 更新页面标题
            document.title = this.settings.form.page_title;
            this.settings.page_title = this.settings.form.page_title;
            this.settings.visible = false;
        },
        restart: function () {
            this.rolling.started = false;
            this.winners = [];
            this.rolling.reminder = [];
            this.rolling.content = '点击下方按钮抽奖';
            this.rolling.btn.msg = '抽 奖';
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