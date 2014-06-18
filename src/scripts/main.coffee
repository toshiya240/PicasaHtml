class ImageMax
  constructor: (@name, @value) ->
    @value = @name unless @value?

class MainViewModel
  constructor: (@config, @htmlArray) ->
    @picasa = new Picasa()

    @albums = ko.observableArray []
    @selectedAlbum = ko.observable()

    @maxResults = ko.observable 20

    @imgmax = [
      new ImageMax "オリジナル", "d"
      new ImageMax "94"
      new ImageMax "110"
      new ImageMax "128"
      new ImageMax "200"
      new ImageMax "220"
      new ImageMax "288"
      new ImageMax "320"
      new ImageMax "400"
      new ImageMax "512"
      new ImageMax "576"
      new ImageMax "640"
      new ImageMax "720"
      new ImageMax "800"
      new ImageMax "912"
      new ImageMax "1024"
      new ImageMax "1152"
      new ImageMax "1280"
      new ImageMax "1440"
      new ImageMax "1600"
    ]
    @selectedImgmax = ko.observable()

    @tag = ko.observable ""

  showSettings: () =>
    $.mobile.changePage '#conf', { transition: 'flip' }

  getAlbums: () =>
    $.mobile.loading("show")

    {albums, status, error} = @picasa.getAlbums(@config.userId())

    $.mobile.loading("hide")

    if error?
      showMsg "#{status}:#{error}(1)"
    else if albums.length is 0
      showMsg "No Albums."
    else
      albums.unshift new Album("All Albums", "")
      @albums(albums)

  getPhotos: () =>
    $.mobile.loading("show")

    { htmlArray, status, error } = @picasa.getPhotos(
        @config.userId(),
        @selectedAlbum().id,
        @config.selectedFormat().value(),
        @maxResults(),
        @selectedImgmax().value,
        @tag()
    )

    $.mobile.loading("hide")

    if error?
      showMsg "#{status}:#{error}(3)"
    else if htmlArray.length is 0
      showMsg "No Photos."
    else
      @htmlArray(htmlArray)
      $.mobile.changePage "#result", { transition: "pop" }
