var Trek = require('trek');

var app = new Trek();

app.get('/', function* () {
  this.body = 'Star Trek!';
});

app.listen(process.env.PORT || 3000);
