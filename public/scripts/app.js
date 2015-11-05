var FS = {
  hasClass: function(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
  },

  addClass: function(obj, cls) {
    if (!this.hasClass(obj, cls)) obj.className += " " + cls;
  },

  removeClass: function(obj, cls) {
    if (this.hasClass(obj, cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      obj.className = obj.className.replace(reg, ' ');
    }
  },

  toggleClass: function(obj, cls) {
    if (this.hasClass(obj, cls)) {
      this.removeClass(obj, cls);
    } else {
      this.addClass(obj, cls);
    }
  },

  bindEvents: function() {
    var that = this;
    var toggleMenu = document.querySelector(".nav-toggle");
    toggleMenu.addEventListener("touchstart", function(e) {
      that.toggleClass(toggleMenu, "active");
    }, false);
  },

  init: function() {
    this.bindEvents();
  }
};

(function(doc) {
  doc.addEventListener("DOMContentLoaded", function() {
    FS.init();
  }, false);
})(document);
