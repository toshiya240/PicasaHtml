storage =
  set: (key, obj) ->
    this.remove(key)
    window.localStorage.setItem(key, JSON.stringify(obj))
  get: (key) ->
    val = window.localStorage.getItem(key)
    if val? then JSON.parse(val) else ""
  remove: (key) ->
    window.localStorage.removeItem(key)
  clear: () ->
    window.localStorage.clear()

class Format
  constructor: (@name, value, @readonly = true) ->
    @value = ko.observable value

class Placeholder
  constructor: (@name, @value) ->

class ConfigViewModel
  constructor: () ->
    @userId = ko.observable ""

    @customFormat = new Format 'カスタム', "", false
    @availableFormats = [
      new Format '写真のみ(インライン)', "<img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' />"
      new Format '写真のみ(ブロック)',   "<p><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /></p>"
      new Format 'cite付き(ブロック)',   "<p><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /><br /><cite>${title} Photo by ${nickname}</cite></p>"
      new Format '説明付き(ブロック)',   "<p>${description}<br /><img class='picasa_photo' src='${imgURL}' alt='${title}' width='${width}' height='${height}' /></p>"
      @customFormat
    ]
    @selectedFormat = ko.observable()

    @placeholders = [
      new Placeholder 'Picasa 上のニックネーム', '${nickname}'
      new Placeholder 'タイトル',                '${title}'
      new Placeholder '画像のURL',               '${imgURL}'
      new Placeholder '画層の幅',                '${width}'
      new Placeholder '画像の高さ',              '${height}'
      new Placeholder '画像の説明',              '${description}'
    ]

    @load()

  customIsSelected: () =>
    @selectedFormat().name is 'カスタム'

  finish: () =>
    if @save()
      $.mobile.changePage '#main', { transition: 'flip', reverse: true }

  discard: () =>
    @load()
    $.mobile.changePage '#main', { transition: 'flip', reverse: true }

  load: () =>
    @userId(storage.get "conf_picasahtml_user")
    @customFormat.value(storage.get "conf_picasahtml_fmt_custom")
    index = storage.get("conf_picasahtml_fmt_index") ? 0
    @selectedFormat(@availableFormats[index])

  save: () =>
    if @userId() is ""
      showMsg "ユーザID を入力してください。"
      return false
    storage.set "conf_picasahtml_user", @userId()
    storage.set "conf_picasahtml_fmt_custom", @customFormat.value()
    storage.set "conf_picasahtml_fmt_index",
        @availableFormats.indexOf(@selectedFormat())
    return true

  copyPresetToCustom: () =>
    @customFormat.value(@selectedFormat().value())
    showMsg "現在選択しているプリセットの内容を「カスタム」にコピーしました。"

  insertPlaceholder: (placeholder) =>
    ph = placeholder.value
    orig = @selectedFormat().value()
    format = $("#format").get(0)
    pos = format.selectionStart
    npos = pos + ph.length
    @selectedFormat().value(orig.substr(0, pos) + ph + orig.substr(pos))
    format.setSelectionRange(npos, npos)
    format.focus()

$(document).on "pagebeforeshow", "#conf", () ->
  # 選択されている値と表示を同期するため
  $("#preset").selectmenu("refresh")
