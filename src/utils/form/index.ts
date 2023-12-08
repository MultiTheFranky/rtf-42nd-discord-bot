import {
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  TextChannel,
  User,
} from "discord.js";
import { Question, Form } from "types/form";
import { db } from "database";
import logger from "utils/logger";

// Form

export const createForm = (
  id: string,
  name: string,
  description: string,
  questions: Question[]
): Form => {
  db.set(id, {
    id,
    name,
    description,
    questions,
  });
  return {
    id,
    name,
    description,
    questions,
  };
};

export const addQuestion = (form: Form, question: Question): Form => {
  db.set(form.id, {
    ...form,
    questions: [...form.questions, question],
  });
  return {
    ...form,
    questions: [...form.questions, question],
  };
};

export const removeQuestion = (form: Form, questionId: string): Form => {
  db.set(form.id, {
    ...form,
    questions: form.questions.filter((q) => q.id !== questionId),
  });
  return {
    ...form,
    questions: form.questions.filter((q) => q.id !== questionId),
  };
};

export const updateQuestion = (
  form: Form,
  questionId: string,
  question: Question
): Form => {
  db.set(form.id, {
    ...form,
    questions: form.questions.map((q) => (q.id === questionId ? question : q)),
  });
  return {
    ...form,
    questions: form.questions.map((q) => (q.id === questionId ? question : q)),
  };
};

export const updateForm = (form: Form): Form => {
  db.set(form.id, form);
  return form;
};

export const getForm = (formId: string): Form => db.get(formId);

// form + Discord

export const sendFormQuestion = async (
  user: User,
  question: Question,
  formId: string
): Promise<void> => {
  switch (question.type) {
    case "text": {
      await user.send(question.question);
      break;
    }
    case "select": {
      const embed = new EmbedBuilder()
        .setTitle(question.question)
        .setDescription(
          question.options
            ? question.options.map((o) => `${o.emoji} ${o.text}`).join("\n\n")
            : ""
        );
      const userAvatar = user.avatarURL();
      if (userAvatar) {
        embed.setAuthor({
          name: user.username,
          iconURL: userAvatar,
        });
      }
      const message = await user.send({ embeds: [embed] });
      if (question.options) {
        question.options.forEach(async (o) => {
          await message.react(o.emoji);
        });
      }
      break;
    }
    case "multi-select": {
      const embed = new EmbedBuilder()
        .setTitle(question.question)
        .setDescription(
          question.options
            ? question.options.map((o) => `${o.emoji} ${o.text}`).join("\n\n")
            : ""
        );
      const userAvatar = user.avatarURL();
      if (userAvatar) {
        embed.setAuthor({
          name: user.username,
          iconURL: userAvatar,
        });
      }
      const message = await user.send({ embeds: [embed] });
      if (question.options) {
        question.options.forEach(async (o) => {
          await message.react(o.emoji);
        });
      }
      await message.react("✅");
      break;
    }
    default:
      break;
  }
  const form = getForm(formId);
  updateForm({
    ...form,
    lastQuestion: question,
  });
};

export const sendForm = async (form: Form, bot: Client): Promise<void> => {
  const user = await bot.users.fetch(form.id);
  user.send(`**${form.name}**`);
  user.send(form.description);
  await sendFormQuestion(user, form.questions[0], form.id);
};

export const formResponse = async (
  client: Client,
  channel: string,
  form: Form
): Promise<void> => {
  // Create base message if not exists
  const user = await client.users.fetch(form.id);
  const channelToSend = (await client.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.name === channel
  )) as TextChannel;
  let joinMessage = (
    await channelToSend.messages.fetch({
      limit: 100,
    })
  ).find(
    (m) => m.author.id === client.user?.id && m.content.includes(form.name)
  );

  if (!joinMessage) {
    joinMessage = await channelToSend.send(`**${form.name}**`);
  }

  const embed = new EmbedBuilder()
    .setTitle(form.name)
    .setDescription(form.description);
  const fields = form.questions.map((q) => ({
    name: q.question,
    value: q.answer || "No answer",
  }));
  embed.addFields(fields);
  embed.setTimestamp();
  const userAvatar = user.avatarURL();
  if (userAvatar) {
    embed.setAuthor({
      name: user.username,
      iconURL: userAvatar,
    });
  }

  if (joinMessage.hasThread) {
    const { thread } = joinMessage;
    if (!thread) return;
    if (thread.locked) {
      await thread.setLocked(false);
    }
    await thread.send({ embeds: [embed] });
    thread.setLocked(true);
  } else {
    const thread = await joinMessage.startThread({
      name: `**${form.name}**`,
      autoArchiveDuration: 60,
    });
    await thread.send({ embeds: [embed] });
    thread.setLocked(true);
  }
};

export const sendNextQuestion = async (
  client: Client,
  user: User,
  formId: string
): Promise<void> => {
  const form = getForm(formId);
  const { lastQuestion } = form;
  const lastQuestionIndex = form.questions.findIndex(
    (q) => q.id === lastQuestion?.id
  );
  const nextQuestion = form.questions[lastQuestionIndex + 1];
  if (nextQuestion) {
    await sendFormQuestion(user, nextQuestion, formId);
  } else {
    user.send(
      "Gracias por responder el formulario, tus respuestas han sido enviadas a los administradores de R.T.F."
    );
    // Send answer to the guild channel
    await formResponse(client, "baúl", form);
  }
};

export const answerCallback = async (
  client: Client,
  user: User,
  formId: string,
  questionId: string,
  response: string
): Promise<void> => {
  let form = getForm(formId);
  let question = form.questions.find((q) => q.id === questionId);
  if (question) {
    const updatedQuestion = {
      ...question,
      answer: response,
    };
    question = updatedQuestion;
    form = updateQuestion(form, questionId, updatedQuestion);
    await sendNextQuestion(client, user, formId);
  }
};

export const initAnswerCallback = (bot: Client): void => {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    const form = getForm(message.author.id);
    if (form) {
      const { lastQuestion } = form;
      if (lastQuestion) {
        if (lastQuestion.type === "text") {
          const { validators } = lastQuestion;
          if (validators) {
            const validation = validators.map((v) => v(message.content));
            const valid = validation.every((v) => v.valid);
            if (!valid) {
              const errors = validation
                .filter((v) => !v.valid)
                .map((v) => v.message);
              message.reply(errors.join("\n"));
              return;
            }
          }
        }
        await answerCallback(
          bot,
          message.author,
          form.id,
          lastQuestion.id,
          message.content
        );
      }
    } else {
      logger.error("Form not found");
    }
  });
};

export const initReactionCallback = (bot: Client): void => {
  bot.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.guild) return;
    const form = getForm(user.id);
    if (form) {
      const { lastQuestion } = form;
      const response = lastQuestion?.options?.find(
        (o) => o.emoji === reaction.emoji.name || reaction.emoji.name === "✅"
      );
      if (!response) return;
      if (lastQuestion) {
        switch (lastQuestion.type) {
          case "select": {
            await answerCallback(
              bot,
              user as User,
              form.id,
              lastQuestion.id,
              response.emoji
            );
            break;
          }
          case "multi-select": {
            if (reaction.emoji.name === "✅") {
              answerCallback(
                bot,
                user as User,
                form.id,
                lastQuestion.id,
                response.text
              );
              return;
            }
            const updatedQuestion = {
              ...lastQuestion,
              answer: `${
                form.questions.find((q) => q.id === lastQuestion.id)?.answer
              }, ${response.text}`,
            };
            updateQuestion(form, lastQuestion.id, updatedQuestion);
            break;
          }
          default:
            break;
        }
      }
    } else {
      logger.error("Form not found");
    }
  });
};
