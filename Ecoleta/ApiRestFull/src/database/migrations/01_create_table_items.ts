import Knex from 'knex'; //importanto o tipo de knex

export async function up(knex: Knex){
    return knex.schema.createTable('items', table => { //usando o knex para a criação de uma tabela
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('items');
}