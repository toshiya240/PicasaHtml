(function() {
  var Album, ConfigViewModel, ENV, Format, ImageMax, MainViewModel, Picasa, Placeholder, ResultViewModel, configViewModel, mainViewModel, resultViewModel, showMsg, storage,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  mainViewModel = null;

  configViewModel = null;

  resultViewModel = null;

  $(document).on("pagecreate", "#main", function() {
    var htmlArray;
    htmlArray = ko.observableArray();
    configViewModel = new ConfigViewModel();
    mainViewModel = new MainViewModel(configViewModel, htmlArray);
    return resultViewModel = new ResultViewModel(htmlArray);
  });

  $(document).on("pageinit", "#main", function() {
    return ko.applyBindings(mainViewModel, document.getElementById('main'));
  });

  $(document).on("pageshow", "#main", function() {
    var userId;
    if (ENV === "Textwell") {
      window.location.href = "textwell:///webdelegate?init";
      $("#source-container").hide();
    } else {
      $("#twbutton").hide();
    }
    if (ENV !== "Mobile Safari" && ENV !== "iOS in-app") {
      $("#safari-buttons").hide();
    }
    userId = configViewModel.userId();
    if (userId === "") {
      return mainViewModel.showSettings();
    } else {
      return mainViewModel.getAlbums(userId);
    }
  });

  $(document).on("pageinit", "#conf", function() {
    return ko.applyBindings(configViewModel, document.getElementById('conf'));
  });

  $(document).on("pageinit", "#result", function() {
    return ko.applyBindings(resultViewModel, document.getElementById('result'));
  });

  ENV = (function() {
    var env, mobile, safari, ua, urlParam;
    ua = navigator.userAgent;
    mobile = ua.indexOf("Mobile") !== -1;
    safari = ua.indexOf("Safari") !== -1;
    env = "";
    if (mobile && safari) {
      env = "Mobile Safari";
    } else if (mobile) {
      urlParam = window.location.href.split('?')[1];
      if (urlParam === "textwell") {
        env = "Textwell";
      } else {
        env = "iOS in-app";
      }
    } else if (safari) {
      env = "Safari";
    } else {
      env = "Automator";
    }
    return env;
  })();

  showMsg = function(msg) {
    var $dialog;
    $("#error-msg").text(msg);
    $dialog = $("<a href='#error-page' data-rel='dialog'></a>");
    $dialog.get(0).click();
    return $dialog.remove();
  };

  storage = {
    set: function(key, obj) {
      this.remove(key);
      return window.localStorage.setItem(key, JSON.stringify(obj));
    },
    get: function(key) {
      var val;
      val = window.localStorage.getItem(key);
      if (val != null) {
        return JSON.parse(val);
      } else {
        return "";
      }
    },
    remove: function(key) {
      return window.localStorage.removeItem(key);
    },
    clear: function() {
      return window.localStorage.clear();
    }
  };

  Format = (function() {
    function Format(name, value, readonly) {
      this.name = name;
      this.readonly = readonly != null ? readonly : true;
      this.value = ko.observable(value);
    }

    return Format;

  })();

  Placeholder = (function() {
    function Placeholder(name, value) {
      this.name = name;
      this.value = value;
    }

    return Placeholder;

  })();

  ConfigViewModel = (function() {
    function ConfigViewModel() {
      this.insertPlaceholder = __bind(this.insertPlaceholder, this);
      this.copyPresetToCustom = __bind(this.copyPresetToCustom, this);
      this.save = __bind(this.save, this);
      this.load = __bind(this.load, this);
      this.discard = __bind(this.discard, this);
      this.finish = __bind(this.finish, this);
      this.customIsSelected = __bind(this.customIsSelected, this);
      this.userId = ko.observable("");
      this.customFormat = new Format('カスタム', "", false);
      this.availableFormats = [new Format('写真のみ(インライン)', "<img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' />"), new Format('写真のみ(ブロック)', "<p><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /></p>"), new Format('cite付き(ブロック)', "<p><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /><br /><cite>${title} Photo by ${nickname}</cite></p>"), new Format('説明付き(ブロック)', "<p>${description}<br /><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /></p>"), this.customFormat];
      this.selectedFormat = ko.observable();
      this.placeholders = [new Placeholder('Picasa 上のニックネーム', '${nickname}'), new Placeholder('タイトル', '${title}'), new Placeholder('画像のURL', '${imgURL}'), new Placeholder('画層の幅', '${width}'), new Placeholder('画像の高さ', '${height}'), new Placeholder('画像の説明', '${description}')];
      this.load();
    }

    ConfigViewModel.prototype.customIsSelected = function() {
      return this.selectedFormat().name === 'カスタム';
    };

    ConfigViewModel.prototype.finish = function() {
      if (this.save()) {
        return $.mobile.changePage('#main', {
          transition: 'flip',
          reverse: true
        });
      }
    };

    ConfigViewModel.prototype.discard = function() {
      this.load();
      return $.mobile.changePage('#main', {
        transition: 'flip',
        reverse: true
      });
    };

    ConfigViewModel.prototype.load = function() {
      var index, _ref;
      this.userId(storage.get("conf_picasahtml_user"));
      this.customFormat.value(storage.get("conf_picasahtml_fmt_custom"));
      index = (_ref = storage.get("conf_picasahtml_fmt_index")) != null ? _ref : 0;
      return this.selectedFormat(this.availableFormats[index]);
    };

    ConfigViewModel.prototype.save = function() {
      if (this.userId() === "") {
        showMsg("ユーザID を入力してください。");
        return false;
      }
      storage.set("conf_picasahtml_user", this.userId());
      storage.set("conf_picasahtml_fmt_custom", this.customFormat.value());
      storage.set("conf_picasahtml_fmt_index", this.availableFormats.indexOf(this.selectedFormat()));
      return true;
    };

    ConfigViewModel.prototype.copyPresetToCustom = function() {
      this.customFormat.value(this.selectedFormat().value());
      return showMsg("現在選択しているプリセットの内容を「カスタム」にコピーしました。");
    };

    ConfigViewModel.prototype.insertPlaceholder = function(placeholder) {
      var format, npos, orig, ph, pos;
      ph = placeholder.value;
      orig = this.selectedFormat().value();
      format = $("#format").get(0);
      pos = format.selectionStart;
      npos = pos + ph.length;
      this.selectedFormat().value(orig.substr(0, pos) + ph + orig.substr(pos));
      format.setSelectionRange(npos, npos);
      return format.focus();
    };

    return ConfigViewModel;

  })();

  $(document).on("pagebeforeshow", "#conf", function() {
    return $("#preset").selectmenu("refresh");
  });

  ImageMax = (function() {
    function ImageMax(name, value) {
      this.name = name;
      this.value = value;
      if (this.value == null) {
        this.value = this.name;
      }
    }

    return ImageMax;

  })();

  MainViewModel = (function() {
    function MainViewModel(config, htmlArray) {
      this.config = config;
      this.htmlArray = htmlArray;
      this.getPhotos = __bind(this.getPhotos, this);
      this.getAlbums = __bind(this.getAlbums, this);
      this.showSettings = __bind(this.showSettings, this);
      this.picasa = new Picasa();
      this.albums = ko.observableArray([]);
      this.selectedAlbum = ko.observable();
      this.maxResults = ko.observable(20);
      this.imgmax = [new ImageMax("オリジナル", "d"), new ImageMax("94"), new ImageMax("110"), new ImageMax("128"), new ImageMax("200"), new ImageMax("220"), new ImageMax("288"), new ImageMax("320"), new ImageMax("400"), new ImageMax("512"), new ImageMax("576"), new ImageMax("640"), new ImageMax("720"), new ImageMax("800"), new ImageMax("912"), new ImageMax("1024"), new ImageMax("1152"), new ImageMax("1280"), new ImageMax("1440"), new ImageMax("1600")];
      this.selectedImgmax = ko.observable();
      this.tag = ko.observable("");
    }

    MainViewModel.prototype.showSettings = function() {
      return $.mobile.changePage('#conf', {
        transition: 'flip'
      });
    };

    MainViewModel.prototype.getAlbums = function() {
      var albums, error, status, _ref;
      $.mobile.loading("show");
      _ref = this.picasa.getAlbums(this.config.userId()), albums = _ref.albums, status = _ref.status, error = _ref.error;
      $.mobile.loading("hide");
      if (error != null) {
        return showMsg("" + status + ":" + error + "(1)");
      } else if (albums.length === 0) {
        return showMsg("No Albums.");
      } else {
        albums.unshift(new Album("All Albums", ""));
        return this.albums(albums);
      }
    };

    MainViewModel.prototype.getPhotos = function() {
      var error, htmlArray, status, _ref;
      $.mobile.loading("show");
      _ref = this.picasa.getPhotos(this.config.userId(), this.selectedAlbum().id, this.config.selectedFormat().value(), this.maxResults(), this.selectedImgmax().value, this.tag()), htmlArray = _ref.htmlArray, status = _ref.status, error = _ref.error;
      $.mobile.loading("hide");
      if (error != null) {
        return showMsg("" + status + ":" + error + "(3)");
      } else if (htmlArray.length === 0) {
        return showMsg("No Photos.");
      } else {
        this.htmlArray(htmlArray);
        return $.mobile.changePage("#result", {
          transition: "pop"
        });
      }
    };

    return MainViewModel;

  })();

  Album = (function() {
    function Album(title, id) {
      this.title = title;
      this.id = id;
    }

    return Album;

  })();

  Picasa = (function() {
    function Picasa() {
      this.getAlbums = __bind(this.getAlbums, this);
    }

    Picasa.prototype.picasaUrlBase = "http://picasaweb.google.com/data/feed/api/user/";

    Picasa.prototype.getAlbums = function(userId) {
      var albums, error, status, url;
      url = "" + this.picasaUrlBase + userId + "?kind=album&alt=json";
      albums = [];
      status = "";
      error = null;
      $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: url,
        cache: false,
        success: function(data) {
          var albumid, item, items, title, _i, _len, _results;
          items = data.feed.entry;
          if (items.length) {
            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
              title = item.title.$t;
              albumid = item.gphoto$id.$t;
              _results.push(albums.push(new Album(title, albumid)));
            }
            return _results;
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          status = textStatus;
          return error = errorThrown;
        }
      });
      return {
        albums: albums,
        textStatus: status,
        errorThrown: error
      };
    };

    Picasa.prototype.getPhotos = function(userId, selectedAlbum, descFormat, maxResults, imgmax, tag) {
      var displayCount, error, htmlArray, status, url;
      displayCount = maxResults;
      if (selectedAlbum === "") {
        if (maxResults === "") {
          displayCount = maxResults = "20";
        }
      } else {

        /*
        NOTE:
          アルバム指定時に max-results を指定すると古い方から
          指定した件数だけデータが返却される。
          件数を指定する場合は新しい方からの件数としたいため、
          アルバム指定時は全件を取得するようにして、
          表示する際に新しい方から指定された件数だけ表示する。
        
        NOTE:
          Picasa のヘルプによるとアルバム当たりの最大数は 1000
          http://support.google.com/picasa/answer/43879/?hl=ja
         */
        if (maxResults === "") {
          displayCount = "1000";
        }
        maxResults = "1000";
      }
      url = "" + this.picasaUrlBase + userId;
      if (selectedAlbum !== "") {
        url += "/albumid/" + selectedAlbum;
      }
      url += "?kind=photo&alt=json&access=public&imgmax=" + imgmax + "&max-results=" + maxResults;
      if (tag !== "") {
        url += "&tag=" + (encodeURIComponent(tag));
      }
      htmlArray = [];
      status = "";
      error = null;
      $.ajax({
        type: "GET",
        dataType: "json",
        async: false,
        url: url,
        cache: false,
        success: function(data) {
          var content, description, height, i, imgURL, items, nickname, start, title, width, y, _i, _ref, _results;
          items = data.feed.entry;
          if (items && items.length) {
            if (selectedAlbum === "") {
              items = items.reverse();
            }
            start = 0;
            if (displayCount < items.length) {
              start = items.length - displayCount;
            }
            _results = [];
            for (i = _i = start, _ref = items.length; start <= _ref ? _i < _ref : _i > _ref; i = start <= _ref ? ++_i : --_i) {
              title = items[i].media$group.media$title.$t;
              content = items[i].media$group.media$content[0];
              imgURL = content.url;
              width = content.width;
              height = content.height;
              nickname = items[i].media$group.media$credit[0].$t;
              description = items[i].media$group.media$description.$t;
              description = description.replace(/&/g, '&amp;');
              description = description.replace(/</g, '&lt;');
              description = description.replace(/>/g, '&gt;');
              description = description.replace(/"/g, '&quot;');
              description = description.replace(/\n/g, '<br />\n');
              y = String(descFormat);
              y = y.replace(/\${title}/g, title);
              y = y.replace(/\${imgURL}/g, imgURL);
              y = y.replace(/\${width}/g, width);
              y = y.replace(/\${height}/g, height);
              y = y.replace(/\${nickname}/g, nickname);
              y = y.replace(/\${description}/g, description);
              _results.push(htmlArray.push("" + y + "\n\n"));
            }
            return _results;
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          status = textStatus;
          return error = errorThrown;
        }
      });
      return {
        htmlArray: htmlArray,
        status: status,
        error: error
      };
    };

    return Picasa;

  })();

  ResultViewModel = (function() {
    function ResultViewModel(htmlArray) {
      this.htmlArray = htmlArray;
      this.insertToTextwell = __bind(this.insertToTextwell, this);
      this.sendToTextHandler = __bind(this.sendToTextHandler, this);
      this.insertToRowline = __bind(this.insertToRowline, this);
      this.launchMobloggerAndCopy = __bind(this.launchMobloggerAndCopy, this);
      this.insertToMoblogger = __bind(this.insertToMoblogger, this);
      this.launchApp = __bind(this.launchApp, this);
      this.showPhoto = __bind(this.showPhoto, this);
      this.html = ko.computed((function(_this) {
        return function() {
          return _this.htmlArray().join("");
        };
      })(this));
    }

    ResultViewModel.prototype.afterListviewRender = function(element, data) {
      $(element).addClass("ui-li-has-thumb");
      $(element).find("img").addClass("ui-li-thumb");
      return $("#preview").listview("refresh");
    };

    ResultViewModel.prototype.showPhoto = function(listItem) {
      var imgObject;
      $.mobile.changePage("#preview-page", {
        transition: "slide"
      });
      imgObject = $(listItem).find("img").clone();
      imgObject.removeClass("ui-li-thumb");
      imgObject.removeAttr("height");
      imgObject.width("100%");
      return $("#img-preview").html(imgObject);
    };

    ResultViewModel.prototype.launchApp = function(url) {
      $.mobile.changePage("#main");
      return window.location = url + encodeURIComponent(this.html());
    };

    ResultViewModel.prototype.insertToMoblogger = function() {
      return this.launchApp("moblogger://append?text=");
    };

    ResultViewModel.prototype.launchMobloggerAndCopy = function() {
      return this.launchApp("moblogger://pboard?text=");
    };

    ResultViewModel.prototype.insertToRowline = function() {
      return this.launchApp("rowline:///set?loc=bottom&view=lines&text=");
    };

    ResultViewModel.prototype.sendToTextHandler = function() {
      return this.launchApp("myscripts://run?title=TextHandler&text=");
    };

    ResultViewModel.prototype.insertToTextwell = function() {
      return T('add', {
        text: this.html()
      });
    };

    return ResultViewModel;

  })();

}).call(this);
