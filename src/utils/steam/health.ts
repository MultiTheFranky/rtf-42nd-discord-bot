import axios from "axios";

export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await axios.get(
      "https://api.steampowered.com/ISteamWebAPIUtil/GetServerInfo/v1/",
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
