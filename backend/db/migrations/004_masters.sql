CREATE TABLE masters (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id UUID NOT NULL,
                         name TEXT NOT NULL,
                         description TEXT,
                         city TEXT,
                         specializations TEXT[],
                         price_from INTEGER,
                         rating DOUBLE PRECISION DEFAULT 0,
                         created_at TIMESTAMP NOT NULL DEFAULT now(),

                         CONSTRAINT fk_masters_user
                             FOREIGN KEY (user_id)
                                 REFERENCES users(id)
                                 ON DELETE CASCADE
);
