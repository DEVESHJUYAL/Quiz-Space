-- Quiz Space — PostgreSQL schema
-- Spring Boot runs this BEFORE Hibernate and BEFORE any @EventListener.
-- Using CREATE TABLE IF NOT EXISTS means it's safe to run on every boot.

CREATE TABLE IF NOT EXISTS users (
                                     id       BIGSERIAL PRIMARY KEY,
                                     name     VARCHAR(255) NOT NULL,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(50)  NOT NULL
    );

CREATE TABLE IF NOT EXISTS quizzes (
                                       id               BIGSERIAL PRIMARY KEY,
                                       title            VARCHAR(255) NOT NULL,
    description      TEXT,
    duration_minutes INTEGER      NOT NULL,
    open_at          TIMESTAMP,
    close_at         TIMESTAMP,
    quiz_code        VARCHAR(50) UNIQUE,
    teacher_id       BIGINT NOT NULL REFERENCES users(id),
    is_published     BOOLEAN NOT NULL DEFAULT FALSE
    );

CREATE TABLE IF NOT EXISTS quiz_allowed_students (
                                                     quiz_id BIGINT       NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    email   VARCHAR(255) NOT NULL,
    PRIMARY KEY (quiz_id, email)
    );

CREATE TABLE IF NOT EXISTS questions (
                                         id             BIGSERIAL PRIMARY KEY,
                                         text           TEXT        NOT NULL,
                                         type           VARCHAR(50) NOT NULL,
    marks          INTEGER     NOT NULL,
    question_order INTEGER     NOT NULL,
    quiz_id        BIGINT      NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    correct_answer TEXT
    );

CREATE TABLE IF NOT EXISTS options (
                                       id          BIGSERIAL PRIMARY KEY,
                                       text        VARCHAR(255) NOT NULL,
    is_correct  BOOLEAN      NOT NULL DEFAULT FALSE,
    question_id BIGINT       NOT NULL REFERENCES questions(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS quiz_attempts (
                                             id                   BIGSERIAL PRIMARY KEY,
                                             quiz_id              BIGINT      NOT NULL REFERENCES quizzes(id),
    student_id           BIGINT      NOT NULL REFERENCES users(id),
    started_at           TIMESTAMP   NOT NULL,
    submitted_at         TIMESTAMP,
    score                INTEGER,
    status               VARCHAR(50) NOT NULL,
    tab_switch_count     INTEGER     DEFAULT 0,
    fullscreen_exit_count INTEGER    DEFAULT 0,
    devtools_count       INTEGER     DEFAULT 0,
    browser_crash_count  INTEGER     DEFAULT 0,
    CONSTRAINT uq_quiz_student UNIQUE (quiz_id, student_id)
    );

CREATE TABLE IF NOT EXISTS student_answers (
                                               id           BIGSERIAL PRIMARY KEY,
                                               attempt_id   BIGINT  NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id  BIGINT  NOT NULL REFERENCES questions(id),
    response     TEXT,
    is_correct   BOOLEAN,
    marks_awarded INTEGER
    );

CREATE TABLE IF NOT EXISTS solution_uploads (
                                                id          BIGSERIAL PRIMARY KEY,
                                                quiz_id     BIGINT       NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    public_id   VARCHAR(255) NOT NULL,
    caption     TEXT,
    uploaded_at TIMESTAMP    NOT NULL
    );