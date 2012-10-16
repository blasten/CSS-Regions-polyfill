# CSS3 Region polyfill

This polyfill makes CSS3 Regions cross-browser and cross-platform. It uses binary search to find the position of the words, which makes it run really fast.

### About CSS Regions

CSS regions allow content to flow across multiple areas called regions. These regions are not necessarily contiguous in the document order.


### Basic setup

```javascript
var reg = new Regions(document.getElementById('article'));
reg.flowTo(document.getElementById('part_2'));
reg.flowTo(document.getElementById('part_3'));
reg.flowTo(document.getElementById('part_4'));
reg.split();
```

### Chaining

```javascript
(new Regions(document.getElementById('article'))).
  flowTo(document.getElementById('part_2')).
  split();
```

### Events

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

### jQuery build-in plugin

```javascript
$('.article').region('flowTo', $('.article_part'));
```

### Checking native support for CSS3 Regions

```javascript
if (!Regions.nativeSupport()) {
  $('.article').region('flowTo', $('.article_part'));
}
```