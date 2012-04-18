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

var get_albums_pip = "http://pipes.yahoo.com/pipes/pipe.run?_id=0251dcfe51d863a319a3d672f5221e41&";
var picasahtml_pip = "http://pipes.yahoo.com/pipes/pipe.run?_id=6c371ce0ff10b1780cbe9cdf2e01b5b1&";
var picasahtml2_pip = "http://pipes.yahoo.com/pipes/pipe.run?_id=fbf6c6c119cbc4e0449f18435e4458fb&";

var get_albums = function() {
  var userID = storage.get("conf_userID");
  $.mobile.pageLoading();
  var url = get_albums_pip + "_render=json&user=" + userID + "&" + new Date().getTime();
  $.ajax({
    url: url,
    async: true,
    cache: false,
    type: "GET",
    dataType: "json",
    success: function(data) {
      var items = data.value.items;
      if (items.length) {
        $("#album").empty();
        $("<option>").val("").text("All Albums").appendTo("#album");
        for (var i = 0; i < items.length; i++) {
          $("<option>").val(items[i].description).text(items[i].title).appendTo("#album");
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
      alert(errorThrown);
    }
  });
};

var get_photos = function() {
  $.mobile.pageLoading();
  var selected_album = $("#album option:selected").val();
  var url = "";
  if (selected_album == "") {
    url = picasahtml_pip + "_render=json&userID=" + $("#conf_userID").val()
        + "&tmp=" + encodeURIComponent($("#conf_tmp").val())
        + "&fmt=" + $("#conf_fmt").val()
        + "&tag=" + encodeURIComponent($("#tag").val())
        + "&max-results=" +  $("#max").val()
        + "&" + new Date().getTime();
  } else {
    url = picasahtml2_pip + "_render=json&userID=" + $("#conf_userID").val()
        + "&tmp=" + encodeURIComponent($("#conf_tmp").val())
        + "&fmt=" + $("#conf_fmt").val()
        + "&tag=" + encodeURIComponent($("#tag").val())
        + "&albumid=" +  selected_album
        + "&" + new Date().getTime();
  }
  $.ajax({
    url: url,
    async: true,
    cache: false,
    type: "GET",
    dataType: "json",
    success: function(data) {
      var items = data.value.items;
      if (items.length) {
        var x = "";
        for (var i = 0; i < items.length; i++) {
          x += items[i].description + "\n\n";
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
      if (!items.length) {
        alert("No Photos.");
        return;
      }
      $.mobile.changePage("#result", "pop");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.mobile.pageLoading(true);
      alert(errorThrown);
    }
  });
};

var preview_img = function(index) {
  $.mobile.changePage("#preview_page");
  var img_object = $("#preview").children().eq(index).find("img").clone();
  img_object.removeClass("ui-li-thumb");
  img_object.removeAttr("height");
  img_object.width("100%");
  $("#img_preview").html(img_object);
};

var insert_to_draftpad = function() {
  insert_to_dp($("#ta").val());
};

var load_config = function() {
  var conf_userID = storage.get("conf_userID");
  var conf_tmp = storage.get("conf_tmp");
  var conf_fmt = storage.get("conf_fmt");

  if (conf_tmp == "") conf_tmp = "http://dl.dropbox.com/u/529339/bookmarklet/PicasaTemplate.csv";
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
  storage.set("conf_tmp", $("#conf_tmp").val());
  storage.set("conf_fmt", $("#conf_fmt").val());

  return true;
};

var clear_config = function() {
  storage.clear();
  alert("データベースをクリアしました。");
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
