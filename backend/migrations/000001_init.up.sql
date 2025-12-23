CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       email TEXT UNIQUE NOT NULL,
                       password TEXT NOT NULL,
                       role TEXT NOT NULL
);

CREATE TABLE masters (
                         user_id UUID PRIMARY KEY REFERENCES users(id),
                         name TEXT,
                         description TEXT,
                         city TEXT,
                         specializations TEXT[],
                         price_from INT,
                         rating INT DEFAULT 5
);

CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          client_id UUID REFERENCES users(id),
                          title TEXT,
                          description TEXT,
                          furniture_type TEXT,
                          budget INT,
                          deadline TEXT,
                          city TEXT,
                          status TEXT DEFAULT 'published'
);

CREATE TABLE responses (
                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           project_id UUID REFERENCES projects(id),
                           master_id UUID REFERENCES users(id),
                           comment TEXT,
                           price INT,
                           start_date TEXT
);
