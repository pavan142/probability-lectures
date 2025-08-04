import axios from "axios";
import { PlayerProfile, InningsData } from "../types/api";

export const api = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 10000,
});

export const getPlayerProfile = async (
  playerName: string
): Promise<PlayerProfile> => {
  try {
    const response = await api.get(`/player/${encodeURIComponent(playerName)}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Player "${playerName}" not found`);
      }
      throw new Error(
        error.response?.data?.message || "Failed to fetch player data"
      );
    }
    throw new Error("Network error");
  }
};

export const getInningsData = async (): Promise<InningsData> => {
  try {
    const response = await api.get("/innings");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch innings data"
      );
    }
    throw new Error("Network error");
  }
};
