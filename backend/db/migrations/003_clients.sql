CREATE TABLE clients (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id UUID NOT NULL,
                         name TEXT,
                         phone TEXT,
                         created_at TIMESTAMP NOT NULL DEFAULT now(),

                         CONSTRAINT fk_clients_user
                             FOREIGN KEY (user_id)
                                 REFERENCES users(id)
                                 ON DELETE CASCADE
);
