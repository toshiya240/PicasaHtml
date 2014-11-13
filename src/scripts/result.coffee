class ResultViewModel
  constructor: (@htmlArray) ->
    @html = ko.computed () =>
      @htmlArray().join("")

  afterListviewRender: (element, data) ->
    # サムネイル表示時のレンダリングがうまくいかないので
    # 自前でクラスを設定する。
    $(element).addClass("ui-li-has-thumb")
    $(element).find("img").addClass("ui-li-thumb")
    # refresh しないと説明文が画面に収まらない場合がある
    $("#preview").listview("refresh")

  showPhoto: (listItem) =>
    $.mobile.changePage "#preview-page", { transition: "slide" }
    imgObject = $(listItem).find("img").clone()
    imgObject.removeClass("ui-li-thumb")
    imgObject.removeAttr("height")
    imgObject.width("100%")
    $("#img-preview").html(imgObject)

  launchApp: (url) =>
    $.mobile.changePage "#main"
    window.location = url + encodeURIComponent(@html())

  insertToMoblogger: () =>
    this.launchApp("moblogger://append?text=")

  launchMobloggerAndCopy: () =>
    this.launchApp("moblogger://pboard?text=")

  insertToRowline: () =>
    this.launchApp("rowline:///set?loc=bottom&view=lines&text=")

  sendToTextHandler: () =>
    this.launchApp("myscripts://run?title=TextHandler&text=")

  insertToTextwell: () =>
    this.launchApp("textwell:///add?text=")
