import { DiscordCommand } from "types/discord";
import {
  ApplicationCommandOptionType,
  Collection,
  EmbedBuilder,
  Guild,
  TextChannel,
  ThreadAutoArchiveDuration,
  User,
} from "discord.js";
import { writeToDB } from "database";

const TEAMS = ["HQ", "ALPHA", "BRAVO", "SUPPORT"];

const getPlayers = async (guild: Guild, team: string) => {
  // The players are on a role with the name of the team
  const role = (await guild.roles.fetch())
    .filter((roleFetch) => roleFetch.name === team)
    .first();
  if (!role) return [];

  // Get the members of the role
  const members = await role.members;

  // Get the name of the members
  const players = members
    .filter((member) => !member.user.bot && !member.user.system)
    .map((member) => member.nickname ?? member.user.username);

  // Return the players
  return players;
};

const getPlayersId = async (guild: Guild, team: string) => {
  // The players are on a role with the name of the team
  const role = (await guild.roles.fetch())
    .filter((roleFetch) => roleFetch.name === team)
    .first();
  if (!role) return [];

  // Get the members of the role
  const members = await role.members;

  // Get the name of the members
  const players = members.map((member) => member.id);

  // Return the players
  return players;
};

// Create a new command with the slash command builder
export const command: DiscordCommand = {
  name: "event",
  nameLocalizations: {
    "en-US": "event",
    de: "ereignis",
    "es-ES": "evento",
  },
  description: "Creates a new event",
  descriptionLocalizations: {
    "en-US": "Creates a new event",
    de: "Erstellt ein neues Ereignis",
    "es-ES": "Crea un nuevo evento",
  },
  options: [
    {
      name: "name",
      description: "Name of the event",
      nameLocalizations: {
        "en-US": "name",
        de: "name",
        "es-ES": "nombre",
      },
      descriptionLocalizations: {
        "en-US": "Name of the event",
        de: "Name des Ereignisses",
        "es-ES": "Nombre del evento",
      },
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "description",
      description: "Description of the event",
      nameLocalizations: {
        "en-US": "description",
        de: "beschreibung",
        "es-ES": "descripción",
      },
      descriptionLocalizations: {
        "en-US": "Description of the event",
        de: "Beschreibung des Ereignisses",
        "es-ES": "Descripción del evento",
      },
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "channel",
      description: "Channel of the event",
      nameLocalizations: {
        "en-US": "channel",
        de: "kanal",
        "es-ES": "canal",
      },
      descriptionLocalizations: {
        "en-US": "Channel of the event",
        de: "Kanal des Ereignisses",
        "es-ES": "Canal del evento",
      },
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "role",
      description: "Role of the event",
      nameLocalizations: {
        "en-US": "role",
        de: "rolle",
        "es-ES": "rol",
      },
      descriptionLocalizations: {
        "en-US": "Role of the event",
        de: "Rolle des Ereignisses",
        "es-ES": "Rol del evento",
      },
      type: ApplicationCommandOptionType.Role,
      required: false,
    },
    {
      name: "date",
      description: "Date of the event",
      nameLocalizations: {
        "en-US": "date",
        de: "datum",
        "es-ES": "fecha",
      },
      descriptionLocalizations: {
        "en-US": "Date of the event",
        de: "Datum des Ereignisses",
        "es-ES": "Fecha del evento",
      },
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
  execute: async (interaction) => {
    const name = interaction.options.getString("name", true);
    const description = interaction.options.getString("description", true);
    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;
    const role = interaction.options.getRole("role");
    const date =
      interaction.options.getString("date") ??
      new Date(
        new Date().getTime() + (7 - new Date().getDay()) * 24 * 60 * 60 * 1000
      ).toLocaleDateString("es-ES");

    const { guild } = interaction;
    if (!guild) {
      await interaction.reply({
        content: "Something went wrong. Please try again.",
        ephemeral: true,
      });
      return;
    }

    const listOfPlayers = TEAMS.map(async (team): Promise<any | undefined> => {
      if (role && role.name !== team) {
        return;
      }

      const players = await getPlayers(guild, team);
      if (players.length === 0) {
        // eslint-disable-next-line consistent-return
        return {
          name: team,
          value: `- No players in this team`,
          inline: true,
        };
      }
      // eslint-disable-next-line consistent-return
      return {
        name: team,
        value: players.map((player) => `- ${player} => ❔`).join("\n"),
        inline: true,
      };
    });

    const players = (await Promise.all(listOfPlayers)).filter(
      (player) => player
    );

    // Create the event embed
    const eventEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(name)
      .addFields(
        { name: "Date", value: date, inline: true },
        { name: "\u200b", value: "\u200b", inline: false }
      )
      .addFields(players)
      .addFields({
        name: "Opciones",
        value:
          "✅ => Voy a ir\n❌ => No voy a ir\n❓ => No lo sé\n⌚ => Participaré parcialmente",
        inline: false,
      })
      .setImage(
        "https://github.com/MultiTheFranky/rtf-42nd-discord-bot/raw/main/1000x1-00000000.png"
      )
      .setTimestamp();

    if (description) {
      eventEmbed.setDescription(description);
    }

    // Reply to the interaction
    await interaction.reply({
      content: `Event created in ${channel.name}`,
      ephemeral: true,
    });

    // Send the event embed to the channel
    const message = await channel?.send({
      embeds: [eventEmbed],
    });
    // Add the reactions to the embed
    if (message) {
      await message.reactions.removeAll();
      await message.react("✅");
      await message.react("❌");
      await message.react("❓");
      await message.react("⌚");
      // Create thread for the event
      await message.startThread({
        name,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      });
      await writeToDB(message.id, "event");
    }
  },
  onReaction: async (reaction, user) => {
    // Avoid the bot to react
    if (user.bot) return;

    // Get the message
    const { message } = reaction;

    // Get the list of users that reacted with '✅'
    let usersThatReactedWithLike = new Collection<string, User>();

    const messageReaction = await reaction.message.fetch();
    const reactions = messageReaction.reactions.cache;
    const likeReaction = reactions.get("✅");
    if (likeReaction) {
      const usersLikeReact = await likeReaction.users.fetch();
      usersThatReactedWithLike =
        usersThatReactedWithLike.concat(usersLikeReact);
    }

    // Get the list of users that reacted with '❌'
    let usersThatReactedWithDisLike = new Collection<string, User>();
    const disLikeReaction = reactions.get("❌");
    if (disLikeReaction) {
      const usersDisLikeReact = await disLikeReaction.users.fetch();
      usersThatReactedWithDisLike =
        usersThatReactedWithDisLike.concat(usersDisLikeReact);
    }

    // Get the list of users that reacted with '❓'
    let usersThatReactedWithQuestion = new Collection<string, User>();
    const questionReaction = reactions.get("❓");
    if (questionReaction) {
      const usersQuestionReact = await questionReaction.users.fetch();
      usersThatReactedWithQuestion =
        usersThatReactedWithQuestion.concat(usersQuestionReact);
    }

    // Get the list of users that reacted with '⌚'
    let usersThatReactedWithWatch = new Collection<string, User>();
    const watchReaction = reactions.get("⌚");
    if (watchReaction) {
      const usersWatchReact = await watchReaction.users.fetch();
      usersThatReactedWithWatch =
        usersThatReactedWithWatch.concat(usersWatchReact);
    }

    const { guild } = reaction.message;
    if (!guild) {
      return;
    }
    const listOfPlayers = TEAMS.map(async (team) => {
      const players = await getPlayers(guild, team);
      const playersId = await getPlayersId(guild, team);
      // Create a map with key playersId and value players
      const playersMap = new Map(
        playersId.map((id, index) => [id, players[index]])
      );
      const valueOfTeam: string[] = Array.from(playersMap.keys()).map((key) =>
        // eslint-disable-next-line no-nested-ternary
        usersThatReactedWithLike.has(key) &&
        usersThatReactedWithDisLike.has(key)
          ? `- ${playersMap.get(key)} => ❔`
          : // eslint-disable-next-line no-nested-ternary
          usersThatReactedWithLike.has(key)
          ? `- ${playersMap.get(key)} => ✅`
          : // eslint-disable-next-line no-nested-ternary
          usersThatReactedWithDisLike.has(key)
          ? `- ${playersMap.get(key)} => ❌`
          : // eslint-disable-next-line no-nested-ternary
          usersThatReactedWithQuestion.has(key)
          ? `- ${playersMap.get(key)} => ❓`
          : usersThatReactedWithWatch.has(key)
          ? `- ${playersMap.get(key)} => ⌚`
          : `- ${playersMap.get(key)} => ❔`
      );

      return {
        name: team,
        value: valueOfTeam.join("\n"),
        inline: true,
      };
    });

    const players = await Promise.all(listOfPlayers);

    // Update the embed
    const eventEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(message.embeds[0].title)
      .setDescription(message.embeds[0].description)
      .addFields(
        {
          name: "Date",
          value: message.embeds[0].fields[0].value,
          inline: true,
        },
        { name: "\u200b", value: "\u200b", inline: false }
      )
      .addFields(players)
      .addFields({
        name: "Opciones",
        value:
          "✅ => Voy a ir\n❌ => No voy a ir\n❓ => No lo sé\n⌚ => Participaré parcialmente",
        inline: false,
      })
      .setImage(
        "https://github.com/MultiTheFranky/rtf-42nd-discord-bot/raw/main/1000x1-00000000.png"
      )
      .setTimestamp();

    // Edit the message
    await message.edit({
      embeds: [eventEmbed],
    });
  },
};
