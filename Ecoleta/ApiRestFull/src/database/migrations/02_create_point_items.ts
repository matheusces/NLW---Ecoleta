import Knex from 'knex'; //importanto o tipo de knex

export async function up(knex: Knex){
    return knex.schema.createTable('point_items', table => { //usando o knex para a criação de uma tabela
        table.increments('id').primary();

        // Referenciando chave estrangeira na tabela points.
        table.integer('point_id').notNullable().references('id').inTable('points'); 
        
        // Referenciando chave estrangeira na tabela items.
        table.integer('item_id').notNullable().references('id').inTable('items');


    });
}

export async function down(knex: Knex){
    return knex.schema.dropTable('point_items');
}