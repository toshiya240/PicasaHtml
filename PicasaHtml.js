/*
 * PicasaHtml.js
 * @version 2.5.0
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

var loadConfig = function() {
    var confUserID = storage.get("conf_userID");
    var confTmp = storage.get("conf_tmp2");
    if (confTmp == "") confTmp = "http://dl.dropbox.com/u/529339/bookmarklet/PicasaTemplate2.csv";
    var confFmt = storage.get("conf_fmt");
    if (confFmt == "") confFmt = 1;

    $("#conf-userID").val(confUserID);
    $("#conf-tmp").val(confTmp);
    $("#conf-fmt").val(confFmt);
};

var saveConfig = function() {
    if ($("#conf-userID").val() == "") {
        showError("ユーザID を入力してください。");
        return false;
    }
    storage.set("conf_userID", $("#conf-userID").val());
    storage.set("conf_tmp2", $("#conf-tmp").val());
    storage.set("conf_fmt", $("#conf-fmt").val());

    return true;
};

var clearConfig = function() {
    //storage.clear();
    storage.set("conf_userID", "");
    storage.set("conf_tmp2", ""); 
    storage.set("conf_fmt", "");
    loadConfig();
    showError("データベースをクリアしました。");
};

var insertToMoblogger = function() {
    $.mobile.changePage("#main");
    var text = $("#ta").val();
    var url = "moblogger://append?text=" + encodeURIComponent(text);
    window.location = url;
}

var launchMobloggerAndCopy = function() {
    $.mobile.changePage("#main");
    var text = $("#ta").val();
    var url = "moblogger://pboard?text=" + encodeURIComponent(text);
    window.location = url;
}

var insertToDraftpad = function() {
    insertToDp($("#ta").val());
};

var myProcess = function(objectFromDraftPad) {
    var originalText = '';
    if (objectFromDraftPad && objectFromDraftPad.text ) {
        originalText = objectFromDraftPad.text;
    };
    window.insertToDp = function(resultHtml) {
        var insertingText = originalText + "\n" + resultHtml;
        draftpad.replace(insertingText, insertingText.length, 0);
    };
};

function showError(msg) {
    $("#error-msg").text(msg);
    $("<a href='#error-page' data-rel='dialog'></a>").click().remove();
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
    var url = picasaUrlBase + userID + "?kind=album&alt=json"
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
                $("#album").selectedIndex = 0;
                $("#album").selectmenu("refresh");
            }
            $.mobile.hidePageLoadingMsg();
            if (!items.length) {
                showError("No Albums.");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $.mobile.hidePageLoadingMsg();
            showError(textStatus + ":" + errorThrown + "(1)");
        }
    });
}

function getPhotos() {
    $.mobile.showPageLoadingMsg();

    var url = $("#conf-tmp").val();
    var fmt = $("#conf-fmt").val();
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
                $.mobile.hidePageLoadingMsg();
                return;
            }
            getPhotos2(descformat);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $.mobile.hidePageLoadingMsg();
            showError(textStatus + ":" + errorThrown + "(2)");
        }
    });
}

function getPhotos2(descformat) {
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
                showError("No Photos.");
                return;
            }
            $.mobile.changePage("#result", {transition:"pop"});
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $.mobile.hidePageLoadingMsg();
            showError(textStatus + ":" + errorThrown + "(3)");
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
