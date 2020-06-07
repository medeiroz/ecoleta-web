import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';

import './styles.css';
import logo from '../../assets/logo.svg'
import { LeafletMouseEvent } from "leaflet";
import IItem from '../../interfaces/entities/IItem';
import IUF from '../../interfaces/entities/IUF';
import ICity from '../../interfaces/entities/ICity';
import PointRepository from '../../repositories/PointRepository';
import ItemRepository from '../../repositories/ItemRepository';
import IbgeRepository from '../../repositories/IbgeRepository';

import Dropzone from '../../components/dropzone';

const CreatePoint = () => {
  const pointRepository = new PointRepository;
  const itemRepository = new ItemRepository;
  const ibgeRepository = new IbgeRepository;

  const [items, setItems] = useState<IItem[]>([]);
  const [ufs, setUfs] = useState<IUF[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [selectedUf, setSelectedUf] = useState<string>('0');
  const [selectedCity, setSelectedCity] = useState<string>('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    itemRepository.list().then(items => {
      setItems(items);
    });
  }, []);

  useEffect(() => {

    ibgeRepository.getUfs().then(ufs => {
      setUfs(ufs);
    })
  }, []);

  useEffect(() => {
    ibgeRepository.getCitiesByUf(selectedUf).then(cities => {
      setCities(cities);
    });
  }, [selectedUf]);

  function handleChangeUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleChangeCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value } = event.target;
    
    setFormData({ ...formData, [name]: value});
  }

  function handleSelectItem(itemId: number) {
    const alreadySelected = selectedItems.findIndex(item => item === itemId) >= 0;

    if (alreadySelected) {
      const fielteredItems = selectedItems.filter(item => item !== itemId);
      setSelectedItems(fielteredItems);
    } else {
      setSelectedItems([ ...selectedItems, itemId ]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [ latitude, longitude ] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if (selectedFile) {
      data.append('image', selectedFile);
    }

    await pointRepository.create(data);

    alert('Ponto de coleta criado com sucesso!');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

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

          <Map
            center={initialPosition}
            zoom={15}
            onClick={handleMapClick}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker 
              position={selectedPosition}
            />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleChangeUf}
              >
                <option value="0">Selecione uma UF</option>
                { ufs.map(uf => <option key={uf.uf} value={uf.uf} >{uf.name}</option>) }
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleChangeCity}
              >
                <option value="0">Selecione uma Cidade</option>
                { cities.map(city => <option key={city.name} value={city.name} >{city.name}</option>) }
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
            {
              items.map(item => (
                <li
                  key={item.id}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                  onClick={() => handleSelectItem(item.id)}
                >
                  <img src={item.image} alt={item.title}/>
                  <span>{item.title}</span>
                </li>
              ))
            }
            
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;