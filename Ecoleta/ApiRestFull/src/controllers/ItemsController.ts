import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController{
    async index(request: Request, response: Response){ //listagem de items.
        const items = await knex('items').select('*'); //acessando a tabela items e selecionando tudo.

        const serializedItems = items.map(item => { // map percorre os items.
            return { // retornando cada coluna da tabela com o formato especificado.
                id: item.id, 
                title: item.title,
                image_url: 'http://192.168.0.14:3333/uploads/' + item.image,
            };
        });

        return response.json(serializedItems);
    }
}

export default ItemsController;