import api from "../services/api";
import IItem from "../interfaces/entities/IItem";

export default class ItemRepository {

  async list(): Promise<IItem[]> {
    const response = await api.get('items');
    return response.data;
  }

  async get(id: number): Promise<IItem>{
    const response = await api.get(`items/${id}`);
    return response.data;
  }
}