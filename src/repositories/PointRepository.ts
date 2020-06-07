import api from "../services/api";
import IPoint from "../interfaces/entities/IPoint";

export default class PointRepository {

  async list(city?: string, uf?: string, itemsIds?: number[]): Promise<IPoint[]> {
    const response = await api.get('points', {
      params: {
        city,
        uf,
        items: itemsIds,
      }
    });

    return response.data;
  }

  async get(id: number): Promise<IPoint> {
    const response = await api.get(`points/${id}`);
    return response.data;
  }

  async create(pointData: FormData): Promise<IPoint>{
    return await api.post('points', pointData);
  }
}