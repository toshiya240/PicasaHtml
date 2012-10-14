/*
 * PicasaHtml.js
 * @version 2.6.1
 * @author Toshiya NISHIO(http://www.toshiya240.com)
 */
function detectEnv() {
  var ua = navigator.userAgent;
  var mobile = ua.indexOf("Mobile") != -1;
  var safari = ua.indexOf("Safari") != -1;
  var env = "";
  if (mobile && safari) {
    env = "Mobile Safari";
  } else if (mobile) {
    env = "iOS in-app";
  } else if (safari) {
    env = "Safari";
  } else {
    env = "Automator";
  }
  return env;
}

var cookie = {
  set: function(key, obj) {
    var expires = new Date(2030, 1, 1);
    document.cookie = key + "=" + escape(obj) + ";expires=" + expires.toGMTString();
  },
  get: function(key) {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; ++i) {
      var pair = cookies[i].split("=");
      if (pair[0] == key) {
        return unescape(pair[1]);
      }
    }
    return "";
  },
  remove: function(key) {
    var expires = new Date(1900, 1, 1);
    document.cookie = key + "='';expires=" + expires.toGMTString();
  },
  clear: function() {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; ++i) {
      var pair = cookies[i].split("=");
      this.remove(pair[0]);
    }
  }
};
var storage = cookie;

function loadConfig() {
  var confUserID = storage.get("conf_userID");
  $("#conf-userID").val(confUserID);

  var customFmt = storage.get("conf_picasahtml_fmt_custom");
  var $custom = $('#preset option:contains("カスタム")');
  $custom.val(customFmt);

  var selectedIndex = storage.get("conf_picasahtml_fmt_index");
  if (!selectedIndex) selectedIndex = 0;
  var $presetSelect = $("#preset");
  $presetSelect.get(0).selectedIndex = selectedIndex;
  presetSelectionChanged();
};

function saveConfig() {
  if ($("#conf-userID").val() == "") {
    showMsg("ユーザID を入力してください。");
    return false;
  }
  storage.set("conf_userID", $("#conf-userID").val());
  storage.set("conf_picasahtml_fmt_index", $("#preset").get(0).selectedIndex);
  var $selectedPreset = $("#preset option:selected");
  if ($selectedPreset.text() == "カスタム") {
    var format = $("#format").val();
    storage.set("conf_picasahtml_fmt_custom", format);
    var $custom = $('#preset option:contains("カスタム")');
    $custom.val(format);
  }

  return true;
};

function clearConfig() {
  //storage.clear();
  storage.set("conf_userID", "");
  storage.set("conf_picasahtml_fmt_index", "0");
  loadConfig();
  showMsg("データベースをクリアしました。");
};

var preset = {
  '写真のみ(インライン)':"<img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' />",
  '写真のみ(ブロック)':"<p><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /></p>",
  'cite付き(ブロック)':"<p><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /><br /><cite>${title} Photo by ${nickname}</cite></p>",
  '説明付き(ブロック)':"<p>${description}<br /><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /></p>",
  'カスタム':""
};
var placeholder = {
  'Picasa 上のニックネーム':'${nickname}',
  'タイトル':'${title}',
  '画像のURL':'${imgURL}',
  '画層の幅':'${width}',
  '画像の高さ':'${height}',
  '画像の説明':'${description}',
};
function presetSelectionChanged() {
  var $selectedPreset = $("#preset option:selected");
  $("#format").val($selectedPreset.val());

  if ($selectedPreset.text() == 'カスタム') {
    $("#placeholder-container").show();
    $("#copy-preset-container").hide();
    $("#format").attr("readonly", false);
  } else {
    $("#placeholder-container").hide();
    $("#copy-preset-container").show();
    $("#format").attr("readonly", true);
  }
}
function insertPlaceholder(label) {
  var ph = placeholder[label];
  var format = $("#format").get(0);
  var orig = format.value;
  var pos = format.selectionStart;
  var npos = pos + ph.length;
  format.value = orig.substr(0, pos) + ph + orig.substr(pos);
  format.setSelectionRange(npos, npos);
  format.focus();
}
$("#main").live("pagebeforecreate", function() {
  var $placeholderSelect = $("#placeholder");
  for (var label in placeholder) {
    $placeholderSelect.append($("<a data-role='button'>").text(label).attr('href', 'javascript:insertPlaceholder("'+label+'");'));
  }

  preset['カスタム'] = storage.get("conf_picasahtml_fmt_custom");
  var $presetSelect = $("#preset");
  for (var label in preset) {
    $presetSelect.append($("<option>").text(label).val(preset[label]));
  }
  $presetSelect.change(presetSelectionChanged);
});

function copyPresetToCustom() {
  var $selectedPreset = $("#preset option:selected");
  var $custom = $('#preset option:contains("カスタム")');
  $custom.val($selectedPreset.val());
  showMsg("現在選択しているプリセットの内容を「カスタム」にコピーしました。");
}

function insertToMoblogger() {
  $.mobile.changePage("#main");
  var text = $("#ta").val();
  var url = "moblogger://append?text=" + encodeURIComponent(text);
  window.location = url;
}

function launchMobloggerAndCopy() {
  $.mobile.changePage("#main");
  var text = $("#ta").val();
  var url = "moblogger://pboard?text=" + encodeURIComponent(text);
  window.location = url;
}

function insertToDraftpad() {
  insertToDp($("#ta").val());
};

function myProcess(objectFromDraftPad) {
  var originalText = '';
  if (objectFromDraftPad && objectFromDraftPad.text ) {
    originalText = objectFromDraftPad.text;
  };
  window.insertToDp = function(resultHtml) {
    var insertingText = originalText + "\n" + resultHtml;
    draftpad.replace(insertingText, insertingText.length, 0);
  };
};

function showMsg(msg) {
  $("#error-msg").text(msg);
  $dialog = $("<a href='#error-page' data-rel='dialog'></a>");
  $dialog.get(0).click();
  $dialog.remove();
}

$(function() {
  var env = detectEnv();
  if (env == "iOS in-app") {
    window.location.href = "draftpad:///webdelegate?load=myProcess";
    $("#source-containter").hide();
  } else {
    $("#dpbutton").hide();
  }
  if (env != "Mobile Safari") {
    $("#mb-buttons").hide();
  }
  loadConfig();
  var userID = $("#conf-userID").val();
  if (userID == "") {
    $.mobile.changePage("#conf", {transition:"flip"});
  } else {
    getAlbums();
  }
});


var picasaUrlBase = "http://picasaweb.google.com/data/feed/api/user/"

function getAlbums() {
  var userID = $("#conf-userID").val();
  var url = picasaUrlBase + userID + "?kind=album&alt=json";
  $.mobile.showPageLoadingMsg();
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
        $("#album").get().selectedIndex = 0;
        $("#album").selectmenu("refresh");
      }
      $.mobile.hidePageLoadingMsg();
      if (!items.length) {
        showMsg("No Albums.");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.mobile.hidePageLoadingMsg();
      showMsg(textStatus + ":" + errorThrown + "(1)");
    }
  });
}

function getPhotos() {
  $.mobile.showPageLoadingMsg();

  var descformat = $("#format").val();
  var selectedAlbum = $("#album option:selected").val();
  var url = picasaUrlBase + $("#conf-userID").val();
  if (selectedAlbum != "") {
    url = url + "/albumid/" + selectedAlbum;
  }
  var maxResults = $("#max").val();
  if (maxResults == "") {
    maxResults = "20";
  }
  var imgmax = $("#imgmax").val();
  url = url + "?kind=photo&alt=json&access=public&imgmax=" + imgmax
    + "&max-results=" + (selectedAlbum == "" ? maxResults : "999");
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
        if (selectedAlbum == "") {
          items = items.reverse();
        }
        for (var i = 0; i < items.length; i++) {
          var title = items[i].media$group.media$title.$t;
          var content = items[i].media$group.media$content[0];
          var imgURL = content.url;
          var width = content.width;
          var height = content.height;
          var nickname = items[i].media$group.media$credit[0].$t;
          var description = items[i].media$group.media$description.$t;
          description = description.replace(/&/g, '&amp;');
          description = description.replace(/</g, '&lt;');
          description = description.replace(/>/g, '&gt;');
          description = description.replace(/"/g, '&quot;');
          description = description.replace(/\n/g, '<br />\n');
          var y = String(descformat);
          y = y.replace(/\${title}/g, title);
          y = y.replace(/\${imgURL}/g, imgURL);
          y = y.replace(/\${width}/g, width);
          y = y.replace(/\${height}/g, height);
          y = y.replace(/\${nickname}/g, nickname);
          y = y.replace(/\${description}/g, description);
          x = x + y + "\n\n";
        }
        var first = $("#ta").val().length == 0;
        $("#ta").val(x);
        var preview = $("#preview");
        preview.html(x);
        $.each(preview.children(), function(i) {
          var li = $("<li>");
          var link = $("<a>").attr("href", "javascript:previewImg("+i+");");
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
        if (items && items.length && !first) {
          preview.listview('refresh');
        }
      }
      $.mobile.hidePageLoadingMsg();
      if (!items || !items.length) {
        showMsg("No Photos.");
        return;
      }
      $.mobile.changePage("#result", {transition:"pop"});
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.mobile.hidePageLoadingMsg();
      showMsg(textStatus + ":" + errorThrown + "(3)");
    }
  });
}

function previewImg(index) {
  $.mobile.changePage("#preview-page", {transition:"slide"});
  var imgObject = $("#preview").children().eq(index).find("img").clone();
  imgObject.removeClass("ui-li-thumb");
  imgObject.removeAttr("height");
  imgObject.width("100%");
  $("#img-preview").html(imgObject);
}
