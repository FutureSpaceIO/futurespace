
export default {

  * index() {
    yield this.render('welcome/index', {
      content: 'Hello Trek.js!',
      user: this.user
    });
  }

};
