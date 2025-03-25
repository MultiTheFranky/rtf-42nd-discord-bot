import { client } from "server";
import { ChannelType } from "discord.js";
import { mission, onReaction } from "./mission";
import { CronJob } from "./types";
import { mods } from "./mods";
import { lockLastMission } from "./lockLastMission";

export const CronJobs: CronJob[] = [
  {
    name: "missionCronJob",
    execute: async () => {
      const guild = client.guilds.cache.get("1180586120556331107");
      if (!guild) return;
      await mission(guild);
    },
    onReaction: async (reaction, user) => {
      onReaction(reaction, user);
    },
    cron: "0 0 12 * * 1",
  },
  {
    name: "lockLastMission",
    execute: async () => {
      const guild = client.guilds.cache.get("1180586120556331107");
      if (!guild) return;
      await lockLastMission(guild);
    },
    // Every Sunday at 18:15
    cron: "0 15 18 * * 7",
  },
  {
    name: "modsCronJob",
    execute: async () => {
      const guild = client.guilds.cache.get("1180586120556331107");
      if (!guild) return;
      await mods(guild);
    },
    onReaction: async () => {},
    cron: "0 */5 * * * *",
  },
  {
    name: "joinReminderMessage",
    execute: async () => {
      const guild = client.guilds.cache.get("1180586120556331107");
      if (!guild) return;
      const channel = guild.channels.cache.get("1180586121445511200");
      if (!channel || channel.type !== ChannelType.GuildText) return;
      const taskforceRole = guild.roles.cache.get("1180598124268507196");
      if (!taskforceRole) return;
      await channel.send(
        `<@&${taskforceRole.id}>
        
        Si quieres colaborar con nosotros al crecimiento de la 42nd R.T.F la mejor manera de hacerlo es ayudándonos con el reclutamiento. 

        ¿Qué buscamos?

        Capacidad de compromiso
        Seriedad
        Ganas de simular
        Ganas de mejorar
        Ganas de pasarlo bien

        Si conoces a alguien que encaje en esta descripción, no esté activo en otro lugar con nuestro mismo horario de juego, no lo dudes mas, invítalo a unirse a nosotros.

        https://discord.gg/2vwEtBKs9R`,
      );
    },
    // Every Friday at 10:30 PM
    cron: "0 30 22 * * 5",
  },
  {
    name: "reserveReminderMessage",
    execute: async () => {
      const guild = client.guilds.cache.get("1180586120556331107");
      if (!guild) return;
      const channel = guild.channels.cache.get("1186126630981218335");
      if (!channel || channel.type !== ChannelType.GuildText) return;
      const reserveRole = guild.roles.cache.get("1186126264386457630");
      if (!reserveRole) return;
      const rubiUser = guild.members.cache.find(
        (member) => member.user.id === "171389505520140297",
      );
      if (!rubiUser) return;
      await channel.send(
        `<@&${reserveRole.id}>
        
        ¿Pensando en regresar al servicio activo? Ponte en contacto con <@&${rubiUser}> y se tramitará tu regreso.`,
      );
    },
    // Every Friday at 10:30 PM
    cron: "0 0 12 1 * *",
  },
  /*   {
    name: "updateOrbat",
    execute: async () => {
      await createOrbat(client);
    },
    // Every Day at 03:00 AM
    cron: "0 0 3 * * *",
  }, */
];
