import crypto from 'crypto';
import { pbkdf2, joi } from 'trek/lib/king';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {

    username: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false,
      validate: {
        //is: /^\w[\w-]{0,29}$/,
        // https://github.com/regexps/regex-username
        is: /^\w[\w-]+$/,
        notEmpty: true,
        len: [3, 30]
      }
    },

    email: {
      type: DataTypes.STRING(256),
      unique: true,
      allowNull: false,
      validate: {
        // https://github.com/regexps/regex-email
        is: /^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/,
        isEmail: true,
        isLowercase: true,
        notEmpty: true,
        len: [5, 256]
      }
    },

    // If want to allow oauth, maybe `password_hash` and `salt` are not need.
    password_hash: {
      type: DataTypes.STRING(64),
      // allowNull: false
    },

    salt: {
      type: DataTypes.STRING(32),
      // allowNull: false
    },

    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },

    avatar_url: {
      type: DataTypes.STRING,
      //allowNull: false
    },

    last_seen_at: {
      type: DataTypes.DATE
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING
    },

    locale: {
      type: DataTypes.STRING(10)
    },

    // biography
    bio: {
      type: DataTypes.TEXT
    },

    // http://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50
    // md5(trim(email))
    gravatar_id: {
      type: DataTypes.STRING
    },

    website: {
      type: DataTypes.STRING
    },

    location: {
      type: DataTypes.STRING
    },

    company: {
      type: DataTypes.STRING
    },

    ip_address: {
      type: 'inet'
    }

  }, {
    tableName: 'users',
    underscored: true,
    classMethods: {
      associate(models) {
        User.hasMany(models.Passport);
      },

      findByUsernameOrEmail(identifier) {
        let where = {};
        // ~~~'1@1'.indexOf('@') !== 0
        if (~~~identifier.indexOf('@')) {
          where.email = identifier;
        } else {
          where.username = identifier;
        }
        return User.find({
          where: where
        });
      },

      findByEmail(email) {
        return User.find({
          where: {
            email: email
          }
        });
      },

      findByUsername(username) {
        return User.find({
          where: {
            username: username
          }
        });
      },

      salt() {
        return pbkdf2.genSalt();
      },

      hash(password, salt) {
        return pbkdf2.hash(password, salt);
      },

      compare(hash, password, salt) {
        return pbkdf2.compare(hash, password, salt);
      },

      get registerSchema() {
        return this._schema || (this._schema = {
          username: joi.string().regex(/^\w[\w-]+$/).min(3).max(30).required(),
          //email: joi.string().regex(/^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/).email({minDomainAtoms: 1}).min(5).max(256).required(),
          email: joi.string().email({ minDomainAtoms: 2 }).min(5).max(256).required(),
          password: joi.string().min(7).max(200).required()
        });
      },

      validate(object) {
        return joi.validate(object, User.registerSchema, { abortEarly: false });
      },

      emailHash(email) {
        return crypto.createHash('md5').update(email).digest('hex');
      }
    },

    instanceMethods: {
      emailHash() {
        return User.emailHash(this.get('email'));
      }
    },

    hooks: {}
  });

  return User;
};
