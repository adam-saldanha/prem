-- Create database if not exists
SELECT 'CREATE DATABASE premierleague'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'premierleague')\gexec

-- Connect to the database
\c premierleague;

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE premierleague TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
