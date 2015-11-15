(function(doc) {
  doc.addEventListener("DOMContentLoaded", function() {
    var menu = doc.querySelector('.nav-toggle');
    menu.addEventListener('click', function(e) {
      this.classList.toggle('active');
    }, false);
  }, false);
})(document);
