# Picasa

class Album
  constructor: (@title, @id) ->

class Picasa
  picasaUrlBase: "http://picasaweb.google.com/data/feed/api/user/"

  getAlbums: (userId) =>
    url = "#{@picasaUrlBase}#{userId}?kind=album&alt=json"
    albums = []
    status = ""
    error = null
    $.ajax({
      type: "GET", dataType: "json", async: false
      url: url
      cache: false
      success: (data) ->
        items = data.feed.entry
        if items.length
          for item in items
            title = item.title.$t
            albumid = item.gphoto$id.$t
            albums.push new Album(title, albumid)
      error: (jqXHR, textStatus, errorThrown) ->
        status = textStatus
        error = errorThrown

    })
    { albums: albums, textStatus: status, errorThrown: error }

  getPhotos: (userId, selectedAlbum, descFormat, maxResults, imgmax, tag) ->
    displayCount = maxResults

    if selectedAlbum is "" # All album
      displayCount = maxResults = "20" if maxResults is ""
    else
      ###
      NOTE:
        アルバム指定時に max-results を指定すると古い方から
        指定した件数だけデータが返却される。
        件数を指定する場合は新しい方からの件数としたいため、
        アルバム指定時は全件を取得するようにして、
        表示する際に新しい方から指定された件数だけ表示する。
      
      NOTE:
        Picasa のヘルプによるとアルバム当たりの最大数は 1000
        http://support.google.com/picasa/answer/43879/?hl=ja
      ###
      displayCount = "1000" if maxResults is ""
      maxResults = "1000"

    url = "#{@picasaUrlBase}#{userId}"
    url += "/albumid/#{selectedAlbum}" if selectedAlbum isnt ""
    url += "?kind=photo&alt=json&access=public&imgmax=#{imgmax}&max-results=#{maxResults}"
    url += "&tag=#{encodeURIComponent(tag)}" if tag isnt ""

    htmlArray = []
    status = ""
    error = null
    $.ajax({
      type: "GET", dataType: "json", async: false
      url: url
      cache: false
      success: (data) ->
        items = data.feed.entry
        if items and items.length
          if selectedAlbum is ""
            items = items.reverse()
          start = 0
          if displayCount < items.length
            start = items.length - displayCount
          for i in [start...items.length]
            title = items[i].media$group.media$title.$t
            content = items[i].media$group.media$content[0]
            imgURL = content.url
            width = content.width
            height = content.height
            nickname = items[i].media$group.media$credit[0].$t
            description = items[i].media$group.media$description.$t
            description = description.replace(/&/g, '&amp;')
            description = description.replace(/</g, '&lt;')
            description = description.replace(/>/g, '&gt;')
            description = description.replace(/"/g, '&quot;')
            description = description.replace(/\n/g, '<br />\n')
            y = String(descFormat)
            y = y.replace(/\${title}/g, title)
            y = y.replace(/\${imgURL}/g, imgURL)
            y = y.replace(/\${width}/g, width)
            y = y.replace(/\${height}/g, height)
            y = y.replace(/\${nickname}/g, nickname)
            y = y.replace(/\${description}/g, description)
            htmlArray.push "#{y}\n\n"

      error: (jqXHR, textStatus, errorThrown) ->
        status = textStatus
        error = errorThrown
    })
    { htmlArray: htmlArray, status: status, error: error }
