import { GameDig } from "gamedig";

export const getPlayersOnline = async (hostname: string) => {
  try {
    const query = await GameDig.query({
      type: "arma3",
      host: hostname,
    });
    return query.players.length;
  } catch (error) {
    return 0;
  }
};

export const isServerOnline = async (hostname: string) => {
  try {
    const query = await GameDig.query({
      type: "arma3",
      host: hostname,
    });
    return query.players.length > 0;
  } catch (error) {
    return false;
  }
};
