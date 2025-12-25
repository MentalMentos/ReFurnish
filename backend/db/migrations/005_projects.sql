CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          client_id UUID NOT NULL,
                          title TEXT NOT NULL,
                          description TEXT,
                          furniture_type TEXT NOT NULL,
                          budget INTEGER,
                          deadline TIMESTAMP,
                          city TEXT,
                          status TEXT DEFAULT 'published',
                          assigned_master UUID,
                          created_at TIMESTAMP NOT NULL DEFAULT now(),
                          updated_at TIMESTAMP NOT NULL DEFAULT now(),

                          CONSTRAINT fk_projects_client
                              FOREIGN KEY (client_id)
                                  REFERENCES clients(id)
                                  ON DELETE CASCADE,

                          CONSTRAINT fk_projects_master
                              FOREIGN KEY (assigned_master)
                                  REFERENCES masters(id)
                                  ON DELETE SET NULL
);
