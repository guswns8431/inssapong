CREATE TABLE IF NOT EXISTS channel
(
    id serial NOT NULL,
    name varchar(20) NOT NULL,
    password varchar(60),
    CONSTRAINT channel_pkey PRIMARY KEY (id),
    CONSTRAINT name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS channel_member
(
    id serial NOT NULL,
    user_id varchar(10) NOT NULL,
    channel_id integer NOT NULL,
    ban_status boolean NOT NULL DEFAULT false,
    authority varchar(1) NOT NULL DEFAULT 3,
    CONSTRAINT channel_member_pkey PRIMARY KEY (id),
    CONSTRAINT channel_member_com_key UNIQUE (user_id, channel_id)
);

CREATE TABLE IF NOT EXISTS game_history
(
    id serial NOT NULL,
    winner_id varchar(10) NOT NULL,
    loser_id varchar(10) NOT NULL,
    CONSTRAINT game_history_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS message
(
    id serial NOT NULL,
    channel_id integer,
    sender_id varchar(10) NOT NULL,
    receiver_id varchar(10),
    content varchar(90) NOT NULL,
    CONSTRAINT message_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "user"
(
    id varchar(10) NOT NULL,
    nickname varchar(10) NOT NULL,
    email varchar(30) NOT NULL,
    twofactor_status boolean NOT NULL DEFAULT false,
    avatar bytea,
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT unique_nickname UNIQUE (nickname)
);

CREATE TABLE IF NOT EXISTS user_relation
(
    id serial NOT NULL,
    user_id varchar(10) NOT NULL,
    partner_id varchar(10) NOT NULL,
    block_status boolean NOT NULL DEFAULT false,
    CONSTRAINT user_relation_pkey PRIMARY KEY (id),
	CONSTRAINT no_duplicate_follow UNIQUE (user_id, partner_id)
);

ALTER TABLE IF EXISTS channel_member
    ADD CONSTRAINT channel_id FOREIGN KEY (channel_id)
    REFERENCES channel (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS channel_member
    ADD CONSTRAINT user_id FOREIGN KEY (user_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS game_history
    ADD CONSTRAINT loser_id FOREIGN KEY (loser_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS game_history
    ADD CONSTRAINT winner_id FOREIGN KEY (winner_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS message
    ADD CONSTRAINT channel_id FOREIGN KEY (channel_id)
    REFERENCES channel (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS message
    ADD CONSTRAINT receiver_id FOREIGN KEY (receiver_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS message
    ADD CONSTRAINT sender_id FOREIGN KEY (sender_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS message
    ADD CONSTRAINT only_one_channel_id_and_receiver_id
    CHECK ((channel_id IS NULL AND receiver_id IS NOT NULL) OR (channel_id IS NOT NULL AND receiver_id IS NULL));


ALTER TABLE IF EXISTS user_relation
    ADD CONSTRAINT partner_id FOREIGN KEY (partner_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS user_relation
    ADD CONSTRAINT user_id FOREIGN KEY (user_id)
    REFERENCES "user" (id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
