/**
 * CSS3 Region polyfill
 *
 * Copyright 2012 - Emmanuel Garcia
 */
(function(exports) {
  
'use strict';

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
/**
 * Constructs the Region object
 *
 * @param {Element} region The first region
 * @return {Object} a self reference to the instance
 */
function Regions(region) {

  this._regions = [];
  this._parts = [];
  this._observeRegions = true;
  this._splited = false;
  
  this.requestNewRegion = function() {

  };
  this.requestRemoveRegion = function() {

  };

  if (getMutationObserver()) {
    var that = this;
    this._observer = new (getMutationObserver())(
      function(mutations) {
        inspectMutations.call(that, mutations);
    });
  } else {
    this._observer = null;
  }

  this.flowTo(region);

  if (this._regions<1) {
     throw regionException('At least one region is required');
  }

  return this;
}
/**
 * Flows the content to another region
 *
 * @param {Element} region An element in the DOM
 * @return {Object} a self reference to the instance
 */
Regions.prototype.flowTo = function(region) {

  if (isDOMElement(region)) {
    for (var i = 0; i<this._regions.length; i++) {
      if (this._regions[i]===region)
        return false;
    }

    region.isRegion = true;
    this._regions.push(region);
    this._parts.push(null);

    if (this._splited) {
      splitRegion.call(this, i-1);
    }

  } else {
    throw regionException(region + ' is not an element');
  }

  return this;

};
/**
 * Removes a region from the list
 *
 * @param {Element} region The region element to be dropped from the list
 * @return {Object} a self reference to the instance
 */
Regions.prototype.removeRegion = function(region) {

  if (region===null) {
    return this;
  }
  
  region.isRegion = false;

  if (this._observer) {
    this._observer.disconnect();
  }

  for (var i = 0; i<this._regions.length; i++) {
    if (this._regions[i]===region) {
      this.rebuild();
      this._regions.splice(i, 1);
      this._parts.splice(i, 1);

      break;
    }
  }

  this.split();

  return this;

};
/**
 * Split the content into parts
 *
 * @return {Object} A self reference to the instance
 */
Regions.prototype.split = function() {

  this._splited = true;
  this.rebuild();

  if (this._observer) {
    this._observer.disconnect();
  }

  splitRegion.call(this, 0);

  addRegionObservers.call(this);

  return this;

};
/**
 * Get the region number of an element
 *
 * @param {Element} A dom element contained in a region
 * @return {Number} The index of the region
 */
Regions.prototype.getRegionElement = function(element) {

  while (element!==null) {
    if (element.isRegion) {
      for (var i = 0; i<this._regions.length; i++) {
        if (element==this._regions[i])
          return i;
      }
    }
    element = element.parentNode;
  }

  return null;

};
/**
 * Puts the content back to the main region
 *
 * @return {Object} A self reference to the instance
 */
Regions.prototype.rebuild = function() {

  if (this._observer){
    this._observer.disconnect();
  }

  var region, prevRegion, regionElement, prevRegionElement, part;

  for (var i = this._regions.length-1; i > 0; i--) {
    
    part = this._parts[i-1];

    if (part) {
      region = this._regions[i];
      prevRegion = this._regions[i-1];

      regionElement = region;
      prevRegionElement = prevRegion;

      while (regionElement.firstChild) {
        regionElement = regionElement.firstChild;
      }

      while (prevRegionElement.lastChild) {
        prevRegionElement = prevRegionElement.lastChild;
      }

      var fromElement = 0, isTextNode = true;

      while (regionElement!=region) {
        var parent = regionElement.parentNode,
          prevRegionParent = prevRegionElement.parentNode;

        while (parent.childNodes.length>fromElement) {
          if (isTextNode) {
            if (prevRegionElement.nodeType==TEXT_NODE && regionElement.nodeType==TEXT_NODE) {
              prevRegionElement.nodeValue = prevRegionElement.nodeValue + regionElement.nodeValue;
              parent.removeChild(parent.childNodes[0]);
            }
            isTextNode = false;
          } else {
            prevRegionParent.appendChild(parent.childNodes[fromElement]);
          }
        }

        prevRegionElement = prevRegionParent;
        regionElement = parent;
      
        fromElement = fromElement || 1;
      }
      
      if (this._regions[i].firstChild) {
        this._regions[i].removeChild(this._regions[i].firstChild);
      }

      this._parts[i] = null;
     
    }

  }

  this._parts[0] = null;

  return this;

};
/**
 * Gets a list with all the regions
 *
 * @return {Array} List of Elements
 */
Regions.prototype.getRegions = function() {
  return this._regions;
};
/**
 * Checks whether the browser supports CSS3 regions or not
 *
 * @return {Boolean}
 */
Object.defineProperty(Regions, 'nativeSupport', {
  value: function() {
    return false;
  },
  writable : false,
  enumerable : false,
  configurable : false
});
/**
 * Checks whether the browser supports CSS3 regions or not
 *
 * @param {Array} mutations List of mutations of the regions
 */
function inspectMutations(mutations) {

  if (this._observeRegions) {
    var change = false;

    for (var i = 0; i<mutations.length; i++) {
      if (mutations[i].type=='characterData') {
        change = true;
        break;
      }/* else if (mutations[i].type=='attributes') {

      } else {

      }*/
    }

    if (change) {
      this.split();
    }
  }

}
/**
 * Adds observers to every region to listen to changes of properties
 */
function addRegionObservers() {

  if (this._observer) {
    for (var i = 0; i<this._regions.length; i++) {
      this._observer.observe(this._regions[i], {
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
  }

  listenToSizeChanges.call(this);

}
/**
 * Listens to size changes of every region
 */
function listenToSizeChanges() {

  if (this._observeRegions) {

    var regionWidth, regionHeight, change = false, that = this;

    for (var i = 0; i<this._regions.length; i++) {
      regionWidth = this._regions[i].offsetWidth;
      regionHeight = this._regions[i].offsetHeight;

      if (this._regions[i]._offsetWidth!=regionWidth || this._regions[i]._offsetHeight!=regionHeight) {
        
        if ('_offsetWidth' in this._regions[i])
          change = true;

        this._regions[i]._offsetWidth = regionWidth;
        this._regions[i]._offsetHeight = regionHeight;

      }
    }

    if (change) {
      this.split();
    }

    setTimeout(function(){ listenToSizeChanges.call(that); }, 100);
  }

}
/**
 * Splits the content of a region and attachs the remaining to the next region
 *
 * @param {Number} index The index of the region
 * @return {void}
 */
function splitRegion(index) {

  var currentRegion = this._regions[index];

  if (!currentRegion) {
    return;
  }

  var nextRegion = this._regions[index+1];

  currentRegion.style.position = 'relative';

  var height = currentRegion.offsetHeight - parseInt(computedStyle(currentRegion, 'padding-bottom'), 10);
  var section = splitElements(currentRegion, currentRegion, height, [], index);

  this._parts[index] = section;

  if (nextRegion) {
    if (section) {
      for (var i = 0; i<currentRegion.childNodes.length; i++) {
        var copy = currentRegion.childNodes[i].cloneNode(true);
        nextRegion.appendChild(copy);
      }

      var j, k, pathLen = section.path.length,
        currentBaseElement = currentRegion,
        nextBaseElement = nextRegion;


      for (j = 0; j<pathLen; j++) {
        for (k = 0; k<section.path[j]; k++) {
          nextBaseElement.removeChild(nextBaseElement.childNodes[0]);
        }

        var childLen = currentBaseElement.childNodes.length;

        for (k = section.path[j]+1; k<childLen; k++) {
          currentBaseElement.removeChild(currentBaseElement.childNodes[section.path[j]+1]);
        }

        currentBaseElement = currentBaseElement.childNodes[section.path[j]];
        nextBaseElement = nextBaseElement.childNodes[0];
      }

      if (currentBaseElement.nodeType==TEXT_NODE) {
        currentBaseElement.nodeValue = currentBaseElement.nodeValue.substr(0, section.from);
      } else {
        var parent = currentBaseElement.parentNode;
        parent.removeChild(currentBaseElement);
      }
      
      if (nextBaseElement.nodeType==TEXT_NODE) {
        nextBaseElement.nodeValue =  nextBaseElement.nodeValue.substr(section.from);
      }

      // Next region
      splitRegion.call(this, index+1);

    } else {
      this.requestRemoveRegion(nextRegion);
    }

  } else {
    if (section) {
      this.requestNewRegion();
    }
  }
  
}
/**
 * Detects the node and position where the content must be splited
 *
 * @param {Element} element
 * @param {Element} baseElement
 * @param {Number} hight
 * @param {Array} path
 * @param {Number} index
 * @return {Spot} where `path` is the address of the element in the DOM
 *        tree relative to the region element and `from` the character
 *        position if element is TEXT_NODE
 */
function splitElements(element, baseElement, height, path, index) {

  var currentElem, currentDisplay, yOffset;

  for (var i = 0; i<element.childNodes.length; i++) {
    currentElem = element.childNodes[i];

    if (currentElem.nodeType==ELEMENT_NODE) {
      currentDisplay = currentElem.style.display;
      currentElem.style.display = 'inline-block';
      yOffset = getOffset(currentElem, baseElement).top + currentElem.offsetHeight;
      currentElem.style.display = currentDisplay;

      if (yOffset > height) {
        if (isBlock(currentElem.tagName)) {
          return {path: path.concat(i), from: -1};
        } else {
          var found = splitElements(currentElem, baseElement, height, path.concat(i), index);
          if (found) {
            return found;
          }
        }
      }
    } else if (currentElem.nodeType==TEXT_NODE) {
      var mid,
        text = currentElem.nodeValue.replace(/\s+/g, ' '),
        textLength = text.length,
        wordStartPosition = 0,
        span = document.createElement('span'),
        rightHand = document.createTextNode(''),
        currentPivot = word(Infinity, 0, 0),
        left = 0,
        right = textLength;

      element.insertBefore(span, currentElem.nextSibling);
      element.insertBefore(rightHand, span.nextSibling);

      // O(log n)

      while (left < right) {
        mid = Math.floor((left + right) / 2);

        currentPivot.start = text.indexOf(' ', mid);
        currentPivot.end  = text.indexOf(' ', currentPivot.start+1);

        if (currentPivot.start==-1 || currentPivot.end==-1)
          break;

        span.style.display = (currentPivot.end-1>currentPivot.start) ? 'inline' : 'inline-block';
        setWordElement(text, currentPivot, span);
        currentPivot.top = getOffset(span, baseElement).top + span.offsetHeight;

        if (currentPivot.top>height)
          right = mid-1;
        else if (currentPivot.top<height)
          left = mid+1;
        else
            break;

      }

      if (currentPivot.start==-1 || currentPivot.end==-1) {
        // Remove span element
        currentElem.nodeValue =  currentElem.nodeValue + ' ' + span.innerHTML + ' ' + span.nextSibling.nodeValue;
        element.removeChild(span);
        element.removeChild(rightHand);
        continue;
      }

      var currentTop, tmpWord;

      // Find word that breaks the line

      if (currentPivot.top<=height) {
        var startSpace = currentPivot.end;

        currentTop = currentPivot.top;
        tmpWord = word();

        while (startSpace<textLength) {
          tmpWord.start = startSpace;
          tmpWord.end = text.indexOf(' ', currentPivot.start+1);

          if (tmpWord.end==-1) {
            tmpWord.end = textLength;
          }

          setWordElement(text, tmpWord, span);

          tmpWord.top = getOffset(span, baseElement).top + span.offsetHeight;

          if (tmpWord.top==currentTop) {
            currentPivot = tmpWord;
            startSpace = currentPivot.end;
          } else {
            break;
          }
        }

        if (tmpWord.top==currentTop) {
          currentPivot.start = currentPivot.end;
        }

      } else {

        var lastSpace = currentPivot.start;

          currentTop = currentPivot.top;
          tmpWord = word();

        while (lastSpace>0) {
          tmpWord.end = lastSpace;
          tmpWord.start = text.lastIndexOf(' ', tmpWord.end-1);

          if (tmpWord.start==-1) {
            tmpWord.start = 0;
          }
          
          setWordElement(text, tmpWord, span);

          tmpWord.top = getOffset(span, baseElement).top + span.offsetHeight;

          if (tmpWord.top==currentTop) {
            currentPivot = tmpWord;
            lastSpace = currentPivot.start;
          } else {
            break;
          }
        }

      }

      // Remove span element

      currentElem.nodeValue =  currentElem.nodeValue + ' ' + span.innerHTML + ' ' + span.nextSibling.nodeValue;
      element.removeChild(span);
      element.removeChild(rightHand);

      return {path: path.concat(i), from: currentPivot.start+1};
    }
  }

  return null;

}
/**
 * Detects if an element cannot be splited
 *
 * @param {String} tagName The tagName property of an element
 * @return {Boolean}
 */
function isBlock(tagName) {

  var blocks = ['IMG', 'IFRAME', 'VIDEO', 'CANVAS', 'SVG'];
  for (var i = 0; i<blocks.length; i++) {
    if (blocks[i]==tagName)
      return true;
  }
  return false;

}
/**
 * Detects if a reference is a DOM element
 *
 * @param {Object} obj
 * @return {Boolean}
 */
function isDOMElement(obj) {

  return (obj &&
    typeof(obj)=='object' &&
    obj instanceof window.Element &&
    obj.nodeType==ELEMENT_NODE);

}
/**
 * Places a fragment of text within an element
 *
 * @param {String} text
 * @param {Word} An instance of Word
 * @param {Element} element
 */
function setWordElement(text, word, element) {
 // if (window.comparisons===undefined) window.comparisons = 0;
 // window.comparisons++;

  element.innerHTML = text.substr(word.start, word.end-word.start);
  element.previousSibling.nodeValue = text.substr(0, word.start);
  element.nextSibling.nodeValue = text.substr(word.end);

}
/**
 * Gets the computed style property of an element
 *
 * @param {Element} element An element
 * @param {String} property CSS property
 */
function computedStyle(element, property) {

  if ('getComputedStyle' in window)
    return window.getComputedStyle(element).getPropertyValue(property);
  else
    return element.style[property];

}
/**
 * Creates a customized exception
 *
 * @param {String} message Error message
 * @param {String} name Default value: RegionError
 */
function regionException(message, name) {

  var Tmp = function (message) {
    this.name = name || 'RegionError';
    this.message = message;
  };

  Tmp.prototype = new Error();
  Tmp.prototype.constructor = Tmp;
  return new Tmp(message);

}
/**
 * Creates a Word Object
 *
 * @param {Number} top The offsetTop value of a word relative to its region
 * @param {Number} start The character position where the word starts in a text node
 * @param {Number} end The character position where the word ends in a text node
 */
function word(top, start, end) {

  return {top: top, start: start, end: end};

}
/**
 * Gets the offset position of an element relative to another
 *
 * @param {Element} obj
 * @param {Element} relative Optional
 * @return {Object} Where left is offsetLeft, top is offsetTop
 */
function getOffset(obj, relative) {

  var offset = {top: 0, left: 0};

  do {
    offset.left += obj.offsetLeft;
    offset.top += obj.offsetTop;
  } while ((obj = obj.offsetParent) && (obj!=relative));

  return offset;

}
/**
 * Gets a reference to the MutationObserver
 */
function getMutationObserver() {

  return window.WebKitMutationObserver || window.MutationObserver;

}

exports.Regions = Regions;

})(this);