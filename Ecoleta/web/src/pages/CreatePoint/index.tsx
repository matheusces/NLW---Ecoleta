import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';
import Dropzone from '../../Components/Dropzone/index';

import './createPoint.css';
import logo from '../../assets/logo.svg';

// sendo que for definido um array ou objeto, é obrigatório informar o tipo da variável
// usando interface para definir os tipos contidos no objeto

interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse{
    sigla: string;
}

interface IBGECITYResponse{
    nome: string;
}

const CreatePoint = () => {
    const history = useHistory();

    // tornando o array do tipo Item
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [ufSelect, setUfSelect] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [citySelect, setCitySelect] = useState('0');
    const [selectPosition, setSelectPosition] = useState<[number, number]>([0, 0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();
    
    const [ selectItems, setSelectItems ] = useState<number[]>([]);
    const [ formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    // Função de ver quando uma uf for selecionada e qual a uf.

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){ //evento do select do tipo changeEvent
        const uf = event.target.value;
        setUfSelect(uf);
    }

    // Função de ver quando uma cidade for selecionada e qual cidade.

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){ //evento do select do tipo changeEvent
        const city = event.target.value;
        setCitySelect(city);
    }

    // Função de selecionar uma localidade no mapa.

    function handleMapClick(event: LeafletMouseEvent){
        setSelectPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    // função de salvar os valores dos inputs independente do nome.

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;

        setFormData({...formData, [name]: value }) // "..." copia todos os dados existentes. "[name]" altera o valor com o nome contido em name.
    }

    // Função de salvar os items que foram selecionados e retirar caso ja tiver sido selecionado.

    function handleSelectItem(id: number){
        const alreadyItems = selectItems.findIndex(item => item === id); // verifica se tem algum item em select items, retorna -1 se não tiver.

        if(alreadyItems >= 0){
            const filteredItems = selectItems.filter(item => item !== id); // filtra os items tirando o que já havia sido selecionado.

            setSelectItems(filteredItems);
        }
        else{
            setSelectItems([ ...selectItems, id ]); // adiciona items selecionados sem excluir os selecionados anteriormente.
        }
    }

    // Função de envio dos dados do formulário para o servidor.

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = ufSelect;
        const city = citySelect;
        const [latitude, longitude] = selectPosition;
        const items = selectItems;

        const data = new FormData(); // cia uma constante que aceite uploads.

        
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        if(selectedFile){
            data.append('image', selectedFile);
        }

        await api.post('points', data);

        alert('Ponto de coleta cadastrado com sucesso');

        history.push('/');
    }

    // toda vez que o segundo parâmetro "[]" for alterado, a função executa.

    // Função de saber a localização atual

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]);
        });
    }, []);

    // Função de listar UFs

    useEffect(() => {
        axios
            .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);

                setUfs(ufInitials);
        });
    }, []);

    // Função de listar cidades

    useEffect(() => {
        if(ufSelect === '0'){
            return;
        }

        axios
            .get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelect}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);

                setCities(cityNames);
        });
    }, [ufSelect]);

    // Função de fazer requisição do items ao backend

    useEffect(() => {
        api.get('items').then(Response => {
            setItems(Response.data);
        });
    }, []);


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectPosition} />
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={ufSelect} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={citySelect} onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>    
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {/*---
                            percorrendo todos os items e usando cada atributo.
                            cada item tem a className alterada se foi selecionado ou não.  
                        ---*/}
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectItems.includes(item.id) ? 'selected': ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;