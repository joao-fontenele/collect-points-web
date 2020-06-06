import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';

import './styles.css';
import logo from '../../assets/logo.svg'
import api from '../../services/api';
import ibge from '../../services/ibge-api';
import { LeafletMouseEvent } from 'leaflet';

interface Item {
  id: number,
  title: string,
  imageUrl: string
}

interface IBGEUFResponse {
  sigla : string,
}

interface IBGECitiesResponse {
  nome: string,
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUFs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState<string>('0');
  const [selectedCity, setSelectedCity] = useState<string>('0');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedMapPosition, setSelectedMapPosition] = useState<[number, number]>([-3.0949229, -60.0462329]);
  const [initialMapPosition, setInitialMapPosition] = useState<[number, number]>([-3.0949229, -60.0462329]);
  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude} = position.coords;
      setInitialMapPosition([latitude, longitude]);
      setSelectedMapPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('/items')
      .then((response) => setItems(response.data));
  }, []);

  useEffect(() => {
    ibge.get<IBGEUFResponse[]>('/api/v1/localidades/estados?orderBy=nome')
      .then((response) => {
        const parsedUFs = response.data.map(uf => uf.sigla);
        setUFs(parsedUFs);
      });
  }, []);

  useEffect(() => {
    if (selectedUF === '0') {
      return;
    }

    ibge.get<IBGECitiesResponse[]>(`/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then((response) => {
        const parsedCities = response.data.map(city => city.nome);
        setCities(parsedCities);
      });
  }, [selectedUF]);

  function handleInputChange(evt: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evt.target;
    setFormData({...formData, [name]: value });
  }

  function handleSelectUF(evt: ChangeEvent<HTMLSelectElement>) {
    const uf = evt.target.value;

    if (uf === '0') {
      setSelectedCity('0');
    }

    setSelectedUF(uf);
  }

  function handleItemClick(id: number) {
    if (selectedItems.includes(id)) {
      return setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
    return setSelectedItems([...selectedItems, id]);
  }

  function handleSelectCity(evt: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(evt.target.value);
  }

  function handleMapClick(evt: LeafletMouseEvent) {
    const { lat, lng: lon } = evt.latlng;
    alert('Ponto de coleta criado com sucesso');
    setSelectedMapPosition([lat, lon]);
  }

  async function handleFormSubit(evt: FormEvent) {
    evt.preventDefault();
    const [lat, lon] = selectedMapPosition;

    const data = {
      ...formData,
      lat,
      lon,
      uf: selectedUF,
      city: selectedCity,
      items: selectedItems,
    };

    await api.post('/points', data);
    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleFormSubit}>
        <h1>Cadastro do <br /> Ponto de Coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              name="name"
              id="name"
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                value={formData.email}
                onChange={handleInputChange}
                type="text"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                value={formData.whatsapp}
                onChange={handleInputChange}
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialMapPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedMapPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" value={selectedCity} id="city" onChange={handleSelectCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.imageUrl} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
