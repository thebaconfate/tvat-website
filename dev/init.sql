/* For development purposes only */
-- Create database if it does not exist
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tvat') THEN
      PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE tvat');
   END IF;
END
$do$;
