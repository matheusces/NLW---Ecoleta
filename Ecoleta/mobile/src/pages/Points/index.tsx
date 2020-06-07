import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import api from '../../services/api';

interface Item{ // define as informações e o tipo de Item
    id: number;
    title: string;
    image_url: string;
}

interface Point{ // define as informações e o tipo de Point
    id: number;
    name: string;
    image: string;
    image_url: string;
    latitude: number;
    longitude: number;
}

interface Params{
    uf: string;
    city: string;
}

const Points = () => {
    // variáveis de estado
    const [ items, setItems ] = useState<Item[]>([]); // array de Items
    const [ selectedItems, setSelectedItems ] = useState<number[]>([]); // array de id dos Items.
    const [ initialPosition, setInitialPosition ] = useState<[number, number]>([0, 0]); // latitude e longitude iniciais.
    const [ points, setPoints] = useState<Point[]>([]); // array de points

    const route = useRoute();
    const params = route.params as Params; // define o tipo dos dados vindos da página anterior.

    // define constante de navegação.
    const navigation = useNavigation();

    // Função de acesso a listagem de items.
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);

    // Função de pegar a localização atual.
    useEffect(() => {
        async function loadPosition(){
            const { status } = await Location.requestPermissionsAsync();
            if(status !== 'granted'){
                Alert.alert('Oops...', 'Precisamos de sua permissão');
                return;
            } 

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude } = location.coords;

            setInitialPosition([
                latitude,
                longitude
            ]);
        }

        loadPosition();
    }, []);

    // useEffects são executadas quando entram na página.

    // Função de pegar os points.
    useEffect(() => {
        api.get('points', {
            params: {
                city: params.city,
                uf: params.uf,
                items: selectedItems
            }
        }).then(response =>{
            setPoints(response.data);
        })
    }, [selectedItems]); // dependência dessa função, toda vez q um novo item é selecionado, atualiza.

    // Função de voltar a página.
    function handleNavigateToBack(){
        navigation.goBack();
    }

    // Função de ir para a próxima página
    function handleNavigateToDetail(id: number){
        navigation.navigate('Detail', { pointId: id }); // passando o id para a página de detalhes.
    }

    // Função de salvar os items que foram selecionados e retirar se ja foi seleciondo
    function handleSelectItem(id: number){
        const alreadyItems = selectedItems.findIndex(item => item === id); // verifica se tem algum item em select items, retorna -1 se não tiver.

        if(alreadyItems >= 0){
            const filteredItems = selectedItems.filter(item => item !== id); // filtra os items tirando o que já havia sido selecionado.

            setSelectedItems(filteredItems);
        }
        else{
            setSelectedItems([ ...selectedItems, id ]); // adiciona items selecionados sem excluir os selecionados anteriormente.
        }
    }

    return(
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateToBack}>
                    <Icon name="arrow-left" size={30} color="#34CB79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem Vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {/** Condição para saber se a posição inicial foi encontrada */}
                    { initialPosition[0] !== 0 && (
                        <MapView 
                            style={styles.map} 
                            loadingEnabled={initialPosition[0] === 0}
                            initialRegion={{ 
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014,
                            }} 
                        >
                            {/** percorrendo todos os points  */}
                            {points.map(point =>(
                                <Marker  //Marcação no mapa
                                    key={String(point.id)}
                                    style={styles.mapMaker}
                                    onPress={() => handleNavigateToDetail(point.id)}
                                    coordinate={{
                                        latitude: point.latitude,
                                        longitude: point.longitude,        
                                    }}
                                >
                                    <View style={styles.mapMakerContainer}>
                                        <Image style={styles.mapMakerImage} source={{ uri: point.image_url }} />
                                        <Text style={styles.mapMakerTitle}>{point.name}</Text>
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    )}                     
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >          
                    {/* key obrigatoriamente String*/} 
                    {items.map(item => (    
                        <TouchableOpacity 
                            key={String(item.id)}
                            /*
                                Se o item já tiver sido selecionado, inserir um novo estilo,
                                caso contrário selecione estilo vazio.
                            */ 
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            activeOpacity={0.4}
                            onPress={() => handleSelectItem(item.id)}
                        >
                            <SvgUri width={42} height={42} uri={item.image_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))} 

                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMaker: {
        width: 90,
        height: 80,
    },

    mapMakerContainer: {
        width: 80,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
    },

    mapMakerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMakerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#000',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;