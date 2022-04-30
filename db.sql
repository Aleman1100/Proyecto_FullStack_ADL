CREATE DATABASE agendaSamus;

\c agendasamus;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE usuarios (email VARCHAR(50) NOT NULL UNIQUE, nombre VARCHAR(25) NOT NULL, password VARCHAR(25) NOT NULL, 
foto VARCHAR(255) NOT NULL, administrador BOOLEAN NOT NULL, moderador BOOLEAN NOT NULL, usuario BOOLEAN NOT NULL, PRIMARY KEY(email));

CREATE TABLE mensajes (id uuid DEFAULT uuid_generate_v4(), contenido VARCHAR(255) NOT NULL, multimedia VARCHAR(255) NOT NULL, 
autor VARCHAR(50) NOT NULL, FOREIGN KEY (autor) REFERENCES usuarios(email)
);