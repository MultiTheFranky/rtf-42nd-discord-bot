import { AdminClient, UserClient } from "@avionrx/pterodactyl-js";

let clientAPI: UserClient;
let applicationAPI: AdminClient;
export const initPterodactylClientAPI = async (): Promise<void> => {
  if (!process.env.PTERODACTYL_URL || !process.env.PTERODACTYL_CLIENT_API_KEY) {
    throw new Error(
      "PTERODACTYL_URL or PTERODACTYL_CLIENT_API_KEY not found in .env file",
    );
  }
  clientAPI = new UserClient(
    process.env.PTERODACTYL_URL,
    process.env.PTERODACTYL_CLIENT_API_KEY,
  );
};

export const initPterodactylApplicationAPI = async (): Promise<void> => {
  if (
    !process.env.PTERODACTYL_URL ||
    !process.env.PTERODACTYL_APPLICATION_API_KEY
  ) {
    throw new Error(
      "PTERODACTYL_URL or PTERODACTYL_APPLICATION_API_KEY not found in .env file",
    );
  }
  applicationAPI = new AdminClient(
    process.env.PTERODACTYL_URL,
    process.env.PTERODACTYL_APPLICATION_API_KEY,
  );
};

export const getServers = async () => {
  if (!applicationAPI) {
    await initPterodactylApplicationAPI();
  }
  return applicationAPI.getServers();
};

export const restartServer = async (serverId: string) => {
  if (!clientAPI) {
    await initPterodactylClientAPI();
  }
  const server = await clientAPI.getClientServer(serverId);
  server.restart();
};
