import ibge from '../services/ibge';
import IUFResponse from "../interfaces/ibge/IUFResponse";
import IUF from '../interfaces/entities/IUF';
import ICity from '../interfaces/entities/ICity';
import ICityResponse from '../interfaces/ibge/ICityResponse';

export default class IbgeRepository {
  async getUfs(): Promise<IUF[]> {

    const response = await ibge.get<IUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    const ufs = response.data.map(uf => {
      return {
        uf: uf.sigla,
        name: uf.nome,
      };
    });

    return ufs;
  }

  async getCitiesByUf(uf: string): Promise<ICity[]> {
    const response = await ibge.get<ICityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    const cities = response.data.map(city => {
      return {
        name: city.nome
      };
    });

    return cities;
  }

  
}