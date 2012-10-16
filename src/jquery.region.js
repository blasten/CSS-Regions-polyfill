/**
 * CSS3 Region polyfill
 * Copyright 2012 - Emmanuel Garcia
 *
 * Usage
 * $(mainSector).region('flowTo', $(groupOfRegions));
 */
(function($) {

function addRegion(method) {
  var jElement = $(this), data = jElement.data();
  if (!data.region || !data.region.flowTo) {
    data.region = new Regions(this);
    data.region.requestNewRegion = function() {
       jElement.trigger('region.requestNewRegion');
    };

    data.region.requestRemoveRegion = function(region) {
      jElement.trigger('region.requestRemoveRegion', [$(region)]);
    };

    data.region.split();
  }

  if (typeof(data.region[method])=='function') {
    if (method=='flowTo') {
      var regions = arguments[1];
      if (regions.length===undefined) {
        data.region.flowTo(regions);
      } else {
        for (var i = 0; i < regions.length; i++) {
          data.region.flowTo(regions[i]);
        }
      }
    } else {
      var parameters = Array.prototype.slice.call(arguments, 1);

      for (var j = 0; j < parameters.length; j++) {
        if (parameters[j].length) {
          parameters[j] = parameters[j][0];
        }
      }
      var result = data.region[method].apply(data.region, parameters);
      if (result && result!=data.region) {
        return result;
      }
    }
  }
}

$.fn.region = function () {
  for (var i = 0; i < this.length; i++) {
    if ((result = addRegion.apply(this[i], arguments))) {
      return result;
    }
  }
  return this;
};
})(jQuery);