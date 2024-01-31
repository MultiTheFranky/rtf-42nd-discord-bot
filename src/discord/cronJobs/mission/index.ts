import { writeToDB } from "discord/database";
import {
  Collection,
  EmbedBuilder,
  Guild,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";

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

export const mission = async (guild: Guild) => {
  // Get the "misiones" channel
  const channel = guild.channels.cache.find(
    (c) => c.name === "misiones"
  ) as TextChannel;
  const name = "Siguiente misión";
  // Get next sunday
  const date = new Date(
    new Date().getTime() + (7 - new Date().getDay()) * 24 * 60 * 60 * 1000
  ).toLocaleDateString("es-ES");

  const listOfPlayers = TEAMS.map(async (team) => {
    const players = await getPlayers(guild, team);
    if (players.length === 0) {
      return {
        name: team,
        value: `- No players in this team`,
        inline: true,
      };
    }
    return {
      name: team,
      value: players.map((player) => `- ${player} => ❔`).join("\n"),
      inline: true,
    };
  });

  const players = await Promise.all(listOfPlayers);

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
    await writeToDB(message.id, "missionCronJob");
  }
};

export const onReaction = async (reaction: MessageReaction, user: User) => {
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
    usersThatReactedWithLike = usersThatReactedWithLike.concat(usersLikeReact);
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
      usersThatReactedWithLike.has(key) && usersThatReactedWithDisLike.has(key)
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
};
