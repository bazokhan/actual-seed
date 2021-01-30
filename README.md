# Export data from sqlite

sqlite> .open ./db/sqlite.db
sqlite> .output ./db/sqlite.sql
sqlite> .dump
sqlite> .exit

# Export schema from sqlite

sqlite> .schemas
copy to .sql file

# Import schema in postgres

psql -h <host-`default:localhost`> -d <database-`default:5432`> -U <user-`default:postgres`> -f <path-to-sqlite-sql-file>

# Import data to postgres

psql -d <database> -U <user>
\i <path-to-sqlite-sql-file>

# Caveats

sqlite column => postgres col
sqlite BLOB => postgres BYTEA
sqlite INT (out of range) => postgres BIGSERIAL

Encoding:
SHOW server_encoding;
SHOW client_encoding;
SET client_encoding TO UTF8;

# Resources

- Convert SQLITE SQL dump file to POSTGRESQL:
  https://stackoverflow.com/questions/4581727/convert-sqlite-sql-dump-file-to-postgresql
- Querying Sqlite database schema:
  https://www.sqlite.org/cli.html
- Connecting to postgres using psql on windows:
  https://www.enterprisedb.com/postgres-tutorials/connecting-postgresql-using-psql-and-pgadmin
- Setting up prisma with postgres:
  https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-sql-node-postgres
- Debugging problems in character encoding:
  https://stackoverflow.com/questions/38481829/postgresql-character-with-byte-sequence-0xc2-0x81-in-encoding-utf8-has-no-equ
