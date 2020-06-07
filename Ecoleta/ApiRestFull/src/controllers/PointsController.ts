import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController{
    async index(request: Request, response: Response){
        const { city, uf, items } = request.query;
        
        // tranforma os items em string e os separa por ',' em uma lista independente dos espaços.
        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct().select('points.*');
        
        
        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.14:3333/uploads/${point.image}`,
            };
        });

        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response){
        const id = request.params.id; //recebendo id enviado pelo usuário.

        const point = await knex('points').where('id', id).first(); // procurando o id na tabela e retornando apenas o primeiro.
        
        if(!point){
            return response.status(400).json({ message: 'Point not found' });
        }

        const serializedPoint = {
            ...point,
            image_url: `http://192.168.0.14:3333/uploads/${point.image}`,
        };

        const items = await knex('items').join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title'); // retorna todos os itens associados a esse id. Foi utilizado o join para relacionar as duas tabelas.

        return response.json({ point: serializedPoint, items });
    }

    async create(request: Request, response: Response){
        const { // recebendo todos os dados que chegam do usuário.
            name,
            email, 
            whatsapp,
            latitude,
            longitude,
            city,
            uf, 
            items
        } = request.body;
    
        // não deixa uma requisição na tabela executar antes da requisição anterior, porque uma depende da outra.
        const trx = await knex.transaction(); 
        
        const points = { // inserindo os dados recebidos na variavel points
            image: request.file.filename,
            name, // se a varável que está sendo inserida tem o mesmo nome da coluna, esse nome pode ser omitido.
            email, // .. mesmo nome
            whatsapp,
            latitude,
            longitude,
            city,
            uf 
         }

        const insertedIds = await trx('points').insert(points); // inserindo os dados de points na tabela points.
    
        const point_id = insertedIds[0]; // toda função insert retorna um id, nesse caso apenas um id da tabela.
        const pointItem = items
            .split(',') // dividindo os items por ',' e colocando em um array
            .map((item: string) => Number(item.trim())) // removendo os espaços entre os items.
            .map((item_id: number) => { //percorrendo os items recebidos. 
                return {
                    item_id, //associando cada item eviado pelo usuário com o novo id da tabela points
                    point_id,
                };
        });

        await trx('point_items').insert(pointItem);
        
        await trx.commit();

        return response.json({
            id: point_id,
            ...points, // representando todos os dados que estão na varável points.
        });
    }
}

export default PointsController;