CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY,

    repo_url TEXT NOT NULL,

    branch TEXT NOT NULL,

    commit_sha TEXT NOT NULL,

    status TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);