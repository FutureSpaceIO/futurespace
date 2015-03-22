export default (sequelize, DataTypes) => {
  const Passport = sequelize.define("Passport", {

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // openid, oauth, oauth2
    protocol: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // for local Bearer JWT(jsonwebtoken)
    access_token: {
      type: DataTypes.STRING,
    },

    /// third-part

    // http://passportjs.org/guide/profile/
    provider: {
      type: DataTypes.STRING
    },

    // A unique identifier for the user, as generated by the service provider
    identifier: {
      type: DataTypes.STRING,
      allowNull: false
    },

    username: {
      type: DataTypes.STRING
    },

    email: {
      type: DataTypes.STRING
    },

    // oauth: { token, tokenSecret }
    // oauth2: { accessToken, refreshToken }
    tokens: {
      type: DataTypes.JSON
    },

    profile: {
      type: DataTypes.JSON
    }

    // username: {
    //   type: DataTypes.STRING
    // },
    //
    // email: {
    //   type: DataTypes.STRING(256),
    //   validate: {
    //     // https://github.com/regexps/regex-email
    //     is: /^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/,
    //     isEmail: true,
    //     isLowercase: true,
    //     len: [5, 256]
    //   }
    // },

    // display_name: {
    //   type: DataTypes.STRING
    // },
    //
    // name: {
    //   type: DataTypes.JSON
    //   /*
    //   family_name: {
    //     type: DataTypes.STRING
    //   },
    //   given_name: {
    //     type: DataTypes.STRING
    //   },
    //   middle_name: {
    //     type: DataTypes.STRING
    //   }
    //   */
    // },
    //
    // emails: {
    //   type: DataTypes.JSON
    // },
    //
    // photos: {
    //   type: DataTypes.JSON
    // }

  }, {
    tableName: 'passports',
    underscored: true,
    classMethods: {
      associate: function(models) {
        Passport.belongsTo(models.User);
      }
    }
  });

  return Passport;
};
