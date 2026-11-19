-- Só no ambiente local (docker-compose): a senha do usuário do pipeline e o banco do estado do Kestra.
alter role pipeline password 'pipeline';
create database kestra;
