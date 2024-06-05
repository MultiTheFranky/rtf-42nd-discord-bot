import { TEAMS, getPlayers, getPlayersId } from "cronJobs/mission";
import { readFromDB, writeToDB } from "database";
import { Collection, EmbedBuilder, Guild, TextChannel, User } from "discord.js";
import { MissionDBData } from "types/cronjobs";

export const lockLastMission = async (guild: Guild) => {
  const lastMission = await readFromDB("lastMission");
  if (!lastMission) {
    return;
  }
  const channel = guild.channels.cache.find(
    (c) => c.name === "misiones",
  ) as TextChannel;
  // Get the message from the guild
  const message = await channel.messages.fetch(lastMission);
  if (!message) {
    return;
  }
  // Get the list of users that reacted with '✅'
  let usersThatReactedWithLike = new Collection<string, User>();

  const messageReaction = await message.fetch();
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

  // Get the list of users that reacted with '⌚'
  let usersThatReactedWithWatch = new Collection<string, User>();
  const watchReaction = reactions.get("⌚");
  if (watchReaction) {
    const usersWatchReact = await watchReaction.users.fetch();
    usersThatReactedWithWatch =
      usersThatReactedWithWatch.concat(usersWatchReact);
  }
  const listOfPlayers = TEAMS.map(async (team) => {
    const players = await getPlayers(guild, team);
    const playersId = await getPlayersId(guild, team);
    // Create a map with key playersId and value players
    const playersMap = new Map(
      playersId.map((id, index) => [id, players[index]]),
    );
    const valueOfTeam: string[] = Array.from(playersMap.keys()).map((key) =>
      // eslint-disable-next-line no-nested-ternary
      usersThatReactedWithLike.has(key) && usersThatReactedWithDisLike.has(key)
        ? `- ${playersMap.get(key)} => ❌`
        : // eslint-disable-next-line no-nested-ternary
          usersThatReactedWithLike.has(key)
          ? `- ${playersMap.get(key)} => ✅`
          : // eslint-disable-next-line no-nested-ternary
            usersThatReactedWithDisLike.has(key)
            ? `- ${playersMap.get(key)} => ❌`
            : usersThatReactedWithWatch.has(key)
              ? `- ${playersMap.get(key)} => ⌚`
              : `- ${playersMap.get(key)} => ❌`,
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
    .setTitle(`🔒 ${message.embeds[0].title} 🔒`)
    .addFields(
      {
        name: "Date",
        value: message.embeds[0].fields[0].value,
        inline: true,
      },
      { name: "\u200b", value: "\u200b", inline: false },
    )
    .addFields(players)
    .addFields({
      name: "Opciones",
      value:
        "✅ => Voy a ir\n❌ => No voy a ir\n⌚ => Participaré parcialmente",
      inline: false,
    })
    .setImage(
      "https://github.com/MultiTheFranky/rtf-42nd-discord-bot/raw/main/1000x1-00000000.png",
    )
    .setTimestamp();

  // Edit the message
  await message.edit({
    embeds: [eventEmbed],
  });
  await writeToDB(lastMission, {
    name: "missionCronJob",
    completed: true,
  } as MissionDBData);
};
