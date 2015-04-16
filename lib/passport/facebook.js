import _ from 'lodash-node';
// facebook filter
export default (req, accessToken, refreshToken, profile, next) => {
  // Facebook remove the `username` field in the latest API.
  if (!profile.username) {
    if (profile.displayName) {
      profile.username = _.kebabCase(profile.displayName);
    } else if (profile.name) {
      let name = _.compact(_.pick(profile.name, 'givenName', 'familyName'));
      profile.username = _.kebabCase(name.join('-'));
    }
  }
  return [req, accessToken, refreshToken, profile, next];
}
