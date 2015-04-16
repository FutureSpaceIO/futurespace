// google filter
export default (req, accessToken, refreshToken, profile, next) => {
  if (!profile.username) {
    if (profile.nickname) {
      profile.username = _.kebabCase(profile.nickname);
    } else if (profile.name) {
      let name = _.compact(_.pick(profile.name, 'givenName', 'familyName'));
      profile.username = _.kebabCase(name.join('-'));
    }
  }
  return [req, accessToken, refreshToken, profile, next];
}
