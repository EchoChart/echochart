-- Ensure the private schema exists
CREATE SCHEMA IF NOT EXISTS private;

ALTER DATABASE postgres
SET
   timezone TO 'Europe/Istanbul';
