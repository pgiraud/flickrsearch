API_KEY = '5d77f76673d1ff027f5c68cf4914045c';
API_SECRET = '368aed40573ce53f';
flickrsearch = (function() {

  var user;
  var flickr_rest_url = 'https://www.flickr.com/services/rest/?';

  var page = 1;

  var selection = d3.select('#photos');

  var auth = flickrAuth({
    api_key: API_KEY,
    api_secret: API_SECRET,
    url: flickr_rest_url,
    done: function(result) {
      getPhotos(page, function(photos) {
        console.log (photos);
        var items = selection.selectAll('.item')
            .data(photos, function(d) { return d.id; });
        var enter = items.enter().append('div')
            .attr('class', 'item');
        enter.append('img')
            .attr('src', function(d) {
              return getPhotoUrl(d, 's');
            });
      });
    }
  });

  function  getPhotos(page, callback) {
    page = page || 1;
    var params = {
      api_key: API_KEY,
      auth_token: oauth_token,
      user_id: user.nsid,
      per_page: 24,
      page: page,
      method: 'flickr.people.getPhotos',
      format: 'json',
      extras: 'geo,machine_tags',
      nojsoncallback: 1
    };
    var signature = auth.signature(params);
    var MD5 = new Hashes.MD5();
    params.api_sig = MD5.hex(signature);

    $.getJSON(flickr_rest_url + $.param(params), function(data) {
      callback(data.photos.photo);
    });
  }

  function getPhotoUrl(photo, size) {
    var url = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg';
    photo.size = size || 's';
    return format(url, photo);
  }

  function format(string, data) {
    return string.replace(/{[^{}]+}/g, function(key){
      return data[key.replace(/[{}]+/g, "")] || "";
    });
  }

  auth.authenticate(function(err, res) {
    user = res.user;
    oauth_token = res.oauth_token;
  });
})();
