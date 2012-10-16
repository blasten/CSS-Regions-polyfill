CSS3 Region polyfill
=======

```javascript
var reg = new Regions(document.getElementById('article'));
reg.flowTo(document.getElementById('part_2'));
reg.flowTo(document.getElementById('part_3'));
reg.flowTo(document.getElementById('part_4'));
reg.split();
```

Dynamic regions
=========
```javascript
  var reg = new Regions(document.getElementById('article'));

    reg.requestNewRegion = function() {
      var region = document.createElement('div');
      region.className = 'region';
      document.body.appendChild(region);
      this.flowTo(region);
    }

    reg.requestRemoveRegion = function(region) {
      this.removeRegion(region);
      region.parentNode.removeChild(region);
    }

    reg.split();

  }
```

Using jQuery
=========
```javascript
$('.article').region('flowTo', $('.article_part'));
```


Checking native support of CSS3 Regions
=========
```javascript
if (!Regions.nativeSupport()) {
  $('.article').region('flowTo', $('.article_part'));
}
```