
SET timezone = 'UTC';

SET search_path TO public;

DROP TYPE IF EXISTS gender;
CREATE TYPE gender AS ENUM ('famale', 'male', 'other');

DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id            integer PRIMARY KEY DEFAULT nextval('users_id_seq') NOT NULL,
  -- email       character varying(254) UNIQUE NOT NULL,
  -- username    character varying(255) UNIQUE NOT NULL,
  username      citext UNIQUE NOT NULL,
  email         citext UNIQUE,
  phone_number  character varying(15) UNIQUE,

  -- nickname
  name          character varying(255),
  -- realname
  fullname      character varying(255),
  birthdate     date,

  -- password hash & salt
  password      character varying(64),
  salt          character varying(32),

  active        boolean DEFAULT FALSE NOT NULL,
  admin         boolean DEFAULT FALSE NOT NULL,
  blocked       boolean DEFAULT FALSE NOT NULL,

  company       character varying(255),
  blog          character varying(255),
  description   text,
  gender        gender,

  location      character varying(255),
  locale        character varying(10),

  ip_address    inet,

  created_at    timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
  updated_at    timestamp with time zone DEFAULT clock_timestamp() NOT NULL
);

ALTER SEQUENCE users_id_seq OWNED BY users.id;

