API_KEY = '5d77f76673d1ff027f5c68cf4914045c';
API_SECRET = '368aed40573ce53f';
flickrsearch = (function() {

  var user;
  var flickr_rest_url = 'https://www.flickr.com/services/rest/?';

  var page = 1;

  var photos = d3.select('#photos');
  var detail = d3.select('#detail');

  var loading = false;

  var listLoading = photos.append('div')
      .attr('class', 'loading')
      .text('loading')
      .style('display', 'none');

  var selection = photos.select('.list');

  var auth = flickrAuth({
    api_key: API_KEY,
    api_secret: API_SECRET,
    url: flickr_rest_url,
    done: function(result) {
      drawList();
    }
  });

  photos.on('scroll', function() {
    loadMore();
  });

  function drawList() {
    loading = true;
    getPhotos(page, function(photos) {
      listLoading.style('display', 'none');
      var items = selection.selectAll('.item')
          .data(photos, function(d) { return d.id; });
      var enter = items.enter().append('div')
          .attr('class', 'item');
      var img = enter.append('img')
          .attr('src', function(d) {
            return getPhotoUrl(d, 's');
          });
      img.on('click', function(d) {
        showDetail(d);
      });
      loading = false;
      window.setTimeout(loadMore, 500);
    });
  }

  function loadMore() {
    if (!loading) {
      var list = photos.node();
      if (list.scrollTop + list.offsetHeight >= list.scrollHeight) {
        page++;
        drawList();

        window.setTimeout(function() {
          listLoading.style('display', '');
        }, 100);
      }
    }
  }

  function showDetail(photo) {
    var select = detail.selectAll('.photo')
        .data([photo], function(d) {return d.id; });
    select.exit().remove();
    var enter = select.enter().append('div')
        .attr('class', 'photo');
    enter.append('img')
        .attr('src', function(d) {
          return getPhotoUrl(d, 'n');
        });
    getSizes(photo, function(sizes) {
      for (var i = 0; i < sizes.length; i++) {
        var size = sizes[i];
        if (size.label == 'Medium 800') {
          data = [size];
        }
      }
      var sizeEnter = select.selectAll('.size')
          .data(data).enter();
      var div = sizeEnter.append('div')
          .attr('class', 'size')
          .html(function(d) {
            return d.label + ' ' + d.width + 'x' + d.height;
          });
      //var button = div.append('button')
          //.attr('class', 'copy')
          //.attr('data-clipboard-text', function(d) { return d.source; })
          //.html('copy url');
      div.append('br');
      var input = div.append('input')
          .attr('type', 'text')
          .attr('value', function(d) {return d.source; });
      var input = div.append('input')
          .attr('type', 'text')
          .attr('value', function(d) {
            return '![](' + d.source + ')';
          });
      div.append('hr');

      //new ZeroClipboard($('.copy'));
    });
  }

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

  function getSizes(photo, callback) {
    var params = {
      api_key: API_KEY,
      auth_token: oauth_token,
      method: 'flickr.photos.getSizes',
      photo_id: photo.id,
      format: 'json',
      extras: 'geo,machine_tags',
      nojsoncallback: 1
    };
    $.getJSON(flickr_rest_url + $.param(params), function(data) {
      callback(data.sizes.size);
    });
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
