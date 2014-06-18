mainViewModel = null
configViewModel = null
resultViewModel = null

# 初期化

$(document).on "pagecreate", "#main", () ->
  htmlArray = ko.observableArray()
  configViewModel = new ConfigViewModel()
  mainViewModel = new MainViewModel(configViewModel, htmlArray)
  resultViewModel = new ResultViewModel(htmlArray)

$(document).on "pageinit", "#main", () ->
  ko.applyBindings mainViewModel, document.getElementById('main')

$(document).on "pageshow", "#main", () ->
  if ENV is "Textwell"
    window.location.href = "textwell:///webdelegate?init"
    $("#source-container").hide()
  else
    $("#twbutton").hide()

  if ENV isnt "Mobile Safari" and ENV isnt "iOS in-app"
    $("#safari-buttons").hide()

  userId = configViewModel.userId()
  if userId is ""
    mainViewModel.showSettings()
  else
    mainViewModel.getAlbums(userId)

$(document).on "pageinit", "#conf", () ->
  ko.applyBindings configViewModel, document.getElementById('conf')

$(document).on "pageinit", "#result", () ->
  ko.applyBindings resultViewModel, document.getElementById('result')

# その他

ENV = do () ->
  ua = navigator.userAgent
  mobile = ua.indexOf("Mobile") isnt -1
  safari = ua.indexOf("Safari") isnt -1
  env = ""
  if mobile and safari
    env = "Mobile Safari"
  else if mobile
    urlParam = window.location.href.split('?')[1]
    if urlParam is "textwell"
        env = "Textwell"
    else
        env = "iOS in-app"
  else if safari
    env = "Safari"
  else
    env = "Automator"
  env

showMsg = (msg) ->
  $("#error-msg").text(msg)
  $dialog = $("<a href='#error-page' data-rel='dialog'></a>")
  $dialog.get(0).click()
  $dialog.remove()
