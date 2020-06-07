import Knex from 'knex'; //importanto o tipo de knex

export async function up(knex: Knex){
    return knex.schema.createTable('points', table => { //usando o knex para a criação de uma tabela
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('latitude').notNullable();
        table.decimal('longitude').notNullable();
        table.string('city').notNullable();
        table.string('uf', 2).notNullable();
    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('points');
}