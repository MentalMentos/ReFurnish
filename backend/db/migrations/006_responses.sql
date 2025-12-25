CREATE TABLE responses (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           project_id UUID NOT NULL,
                           master_id UUID NOT NULL,
                           comment TEXT,
                           price INTEGER,
                           start_date TIMESTAMP,
                           created_at TIMESTAMP NOT NULL DEFAULT now(),

                           CONSTRAINT fk_responses_project
                               FOREIGN KEY (project_id)
                                   REFERENCES projects(id)
                                   ON DELETE CASCADE,

                           CONSTRAINT fk_responses_master
                               FOREIGN KEY (master_id)
                                   REFERENCES masters(id)
                                   ON DELETE CASCADE
);
