class MiilPlayer {
    constructor ($window, $photoPanel, $menuBar, $pagerBar) {
        this.photoPanel = new PhotoPanel($photoPanel);
        this.menuBar = new MenuBar($menuBar);
        this.pagerBar = new PagerBar($pagerBar);
        this.$window = $window;
        this.timer = null;
        this._init();
        this.bindEvents();
        this.INTERVAL = 5000;
    }

    hideBars () {
        this.menuBar.hide();
        this.pagerBar.hide();
    }

    showBars () {
        this.menuBar.show();
        this.pagerBar.show();
    }

    showSamples () {
        var photo_stock = [];
        sampleBase64Photos.forEach(photo => {
            photo_stock.push({photo: photo, page: '#'});
        });
        // 初期collectionを登録
        this.photoPanel.setCollection(photo_stock);
        // 初期画像を表示
        this.showNextItem();
        this.startSlideShow();
    }

    showItemsByAPI (apiUrl) {
        var self = this;
        var photo_stock = [];
        var xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl, true);
        xhr.responseType = 'json';
        xhr.onload = function (e) {
            var res = this.response;
            var photos = res.photo.photos;
            for(var i = 0; i < photos.length; i++) {
                var photo = photos[i].photo_url;
                var page  = photos[i].page_url;
                photo_stock.push({photo: photo, page: page});
            }
            // 初期collectionを登録
            self.photoPanel.setCollection(photo_stock);
            // 初期画像を表示
            self.showNextItem();
            self.startSlideShow();
        }
        xhr.send();
    }

    // 自動スライドショーを開始する
    startSlideShow () {
    }

    // 自動スライドショーを解除する
    clearSlideShow () {
    }

    // 次の写真を表示する
    // NOTE: center-button管理する
    showNextItem () {
        var item = this.photoPanel.getItemIndexOf(this.nextItemIdx);
        var n = true;
        if (item !== null) {
            this.nextItemIdx++;
            this.photoPanel._showPhoto(item);
            this.pagerBar.updateProgressBarByArrIdx(this.nextItemIdx, this.photoPanel.collection.length);
        }else {
            n = false;
        }
        if (this.nextItemIdx >= this.photoPanel.collection.length) {
            n = false;
            this.pagerBar.setCenterBtnIcon('av:replay');
        }
        return n;
    }

    // 前の写真を表示する
    showPrevItem () {
        var n = true;
        if (this.nextItemIdx - 2 >= 0) {
            var idx = this.nextItemIdx - 2;
            var item = this.photoPanel.getItemIndexOf(idx);
            if (item !== null) {
                this.nextItemIdx--;
                this.photoPanel._showPhoto(item);
                this.pagerBar.updateProgressBarByArrIdx(this.nextItemIdx, this.photoPanel.collection.length);
            }else {
                n = false;
            }
        }else {
            n = false;
        }
        return n;
    }

    _init () {
        this.nextItemIdx = 0;
    }

    bindEvents () {
        // 次の写真を表示する要求
        this.pagerBar.skipNextBtn().on('click', e => {
            this.showNextItem();
        });

        // 前の写真を表示する要求
        this.pagerBar.skipPrevBtn().on('click', e => {
            this.showPrevItem();
        });

        this.pagerBar.centerBtn().on('click', e => {
            // collectionをreplyする
            if (this.pagerBar.centerBtn()[0].icon === 'av:replay') {
                //this.pagerBar.centerBtn()[0].icon = 'av:pause';
                this.nextItemIdx = 0;
                this.showNextItem();
                this.startSlideShow();
            }
        });

        // 写真がホバーされた場合，ホバーが外された場合
        $('body').on('mouseenter', e => {
            if (document.hasFocus()) this.showBars();
        }).on('mouseleave', e => {
            this.hideBars();
        });

        // 左右矢印ボタンで写真遷移
        $(window).on('keyup', e => {
            this.hideBars();
            var c = e.keyCode;
            if (c === 39) {
                // `→`
                this.showNextItem();
            }else if (c === 37) {
                // `←`
                this.showPrevItem();
            }
        });
    }
}
