var storage = {
  set:
    function(key, obj) {
      this.remove(key);
      window.localStorage.setItem(key, JSON.stringify(obj));
    },
  get:
    function(key) {
      var val = window.localStorage.getItem(key);
      if (val == null || val == "undefined") {
        return "";
      } else {
        return JSON.parse(val);
      }
    },
  remove:
    function(key) {
      window.localStorage.removeItem(key);
    },
  clear:
    function() {
      window.localStorage.clear();
    }
};

var load_config = function() {
  var conf_userID = storage.get("conf_userID");
  var conf_tmp = storage.get("conf_tmp2");
  var conf_fmt = storage.get("conf_fmt");

  if (conf_tmp == "") conf_tmp = "http://dl.dropbox.com/u/529339/bookmarklet/PicasaTemplate2.csv";
  if (conf_fmt == "") conf_fmt = 1;

  $("#conf_userID").val(conf_userID);
  $("#conf_tmp").val(conf_tmp);
  $("#conf_fmt").val(conf_fmt);
};

var save_config = function() {
  if ($("#conf_userID").val() == "") {
    alert("ユーザID を入力してください。");
    return false;
  }
  storage.set("conf_userID", $("#conf_userID").val());
  storage.set("conf_tmp2", $("#conf_tmp").val());
  storage.set("conf_fmt", $("#conf_fmt").val());

  return true;
};

var clear_config = function() {
  storage.clear();
  alert("データベースをクリアしました。");
};

var insert_to_draftpad = function() {
  insert_to_dp($("#ta").val());
};

var myProcess = function(objectFromDraftPad) {
  var original_text = '';
  if (objectFromDraftPad && objectFromDraftPad.text ) {
      original_text = objectFromDraftPad.text;
  };
  window.insert_to_dp = function(result_html) {
    var inserting_text = original_text + "\n" + result_html;
    draftpad.replace(inserting_text, inserting_text.length, 0);
  };
};

$(function() {
  window.location.href = "draftpad:///webdelegate?load=myProcess";
  load_config();
  var userID = $("#conf_userID").val();
  if (userID == "") {
    $.mobile.changePage("#conf", "flip");
  } else {
    get_albums();
  }
});


var picasa_url_base = "http://picasaweb.google.com/data/feed/api/user/"

function get_albums() {
  var userID = $("#conf_userID").val();
  var url = picasa_url_base + userID + "?kind=album&alt=json"
  $.mobile.pageLoading();
  $.ajax({
    url: url,
    async: true,
    cache: false,
    type: "GET",
    dataType: "json",
    success: function(data) {
      var items = data.feed.entry;
      if (items.length) {
        $("#album").empty();
        $("<option>").val("").text("All Albums").appendTo("#album");
        for (var i = 0; i < items.length; i++) {
          title = items[i].title.$t;
          albumid = items[i].gphoto$id.$t;
          $("<option>").val(albumid).text(title).appendTo("#album");
        }
        $("#album").selectedIndex = 0;
        $("#album").selectmenu("refresh");
      }
      $.mobile.pageLoading(true);
      if (!items.length) {
        alert("No Albums.");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.mobile.pageLoading(true);
      alert(textStatus + ":" + errorThrown);
    }
  });
}

function get_photos() {
  $.mobile.pageLoading();

  var url = $("#conf_tmp").val();
  var fmt = $("#conf_fmt").val();
  var descformat = "";
  $.ajax({
    url: url,
    async: true,
    cache: false,
    type: "GET",
    dataType: "text",
    success: function(data) {
      var lines = data.split("\n");
      var index = parseInt(fmt) + 8;
      if (lines.length <= index) {
        index = 9;
      }
      descformat = lines[index];
      if (descformat == "") {
        $.mobile.pageLoading(true);
        return;
      }
      get_photos2(descformat);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.mobile.pageLoading(true);
      alert(textStatus + ":" + errorThrown);
    }
  });
}

function get_photos2(descformat) {
  var selected_album = $("#album option:selected").val();
  var url = picasa_url_base + $("#conf_userID").val();
  if (selected_album != "") {
    url = url + "/albumid/" + selected_album;
  }
  var max_results = $("#max").val();
  if (max_results == "") {
    max_results = "20";
  }
  url = url + "?kind=photo&alt=json&access=public&max-results="
      + (selected_album == "" ? max_results : "999");
  var tag = $("#tag").val();
  if (tag != "") {
    url = url + "&tag=" + encodeURIComponent(tag);
  }
  $.ajax({
    url: url,
    async: true,
    cache: false,
    type: "GET",
    dataType: "json",
    success: function(data) {
      var items = data.feed.entry;
      if (items && items.length) {
        var x = "";
        for (var i = 0; i < items.length; i++) {
          var title = items[i].media$group.media$title.$t;
          var content = items[i].media$group.media$content[0];
          var imgURL = content.url;
          var width = content.width;
          var height = content.height;
          var nickname = items[i].media$group.media$credit[0].$t;
          var y = String(descformat);
          y = y.replace(/\${title}/g, title);
          y = y.replace(/\${imgURL}/g, imgURL);
          y = y.replace(/\${width}/g, width);
          y = y.replace(/\${height}/g, height);
          y = y.replace(/\${nickname}/g, nickname);
          x = x + y + "\n\n";
        }
        $("#ta").val(x);
        var preview = $("#preview");
        preview.html(x);
        $.each(preview.children(), function(i) {
          var li = $("<li>");
          var link = $("<a>").attr("href", "javascript:preview_img("+i+");");
          /*
           * サムネイル表示時のレンダリングがうまくいかないので
           * 自前でクラスを設定する。
           */
          li.addClass("ui-li-has-thumb");
          $(this).find("img").addClass("ui-li-thumb");

          link.append($(this));
          li.append(link);
          preview.append(li);
        });
        preview.listview();
        preview.listview("refresh");
      }
      $.mobile.pageLoading(true);
      if (!items || !items.length) {
        alert("No Photos.");
        return;
      }
      $.mobile.changePage("#result", "pop");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.mobile.pageLoading(true);
      alert(textStatus + ":" + errorThrown);
    }
  });
}

function preview_img(index) {
  $.mobile.changePage("#preview_page");
  var img_object = $("#preview").children().eq(index).find("img").clone();
  img_object.removeClass("ui-li-thumb");
  img_object.removeAttr("height");
  img_object.width("100%");
  $("#img_preview").html(img_object);
}
