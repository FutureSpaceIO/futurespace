var Trek = require('trek');

var app = new Trek();
console.log(app.calledFrom);

app.get('/', function* () {
  this.body = 'Star Trek!';
});

app.listen(2333);
