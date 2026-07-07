-- =====================================================================
-- Idempotent local-PostgreSQL bootstrap for testPrepSmallHello.
-- Run as a superuser:  psql -U postgres -f db/bootstrap/00_create_role_and_db.sql
-- Creates a DEDICATED role + database. Safe to re-run.
-- =====================================================================

-- 1. Dedicated role (create-or-alter) — never reuse a shared role.
DO
$$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tsm') THEN
        ALTER ROLE tsm WITH LOGIN PASSWORD 'tsm123';
    ELSE
        CREATE ROLE tsm WITH LOGIN PASSWORD 'tsm123';
    END IF;
END
$$;

-- 2. Database (CREATE DATABASE cannot run inside a DO block; use \gexec).
SELECT 'CREATE DATABASE "testSmall" OWNER tsm'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'testSmall')
\gexec

-- 3. Database-level grants.
GRANT ALL PRIVILEGES ON DATABASE "testSmall" TO tsm;

-- 4. Named schema + schema-level grants (connect to the target DB).
\connect "testSmall"

CREATE SCHEMA IF NOT EXISTS test_small AUTHORIZATION tsm;
GRANT ALL ON SCHEMA test_small TO tsm;
ALTER ROLE tsm SET search_path = test_small, public;
