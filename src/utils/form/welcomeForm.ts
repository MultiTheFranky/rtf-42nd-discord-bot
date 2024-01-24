import { User } from "discord.js";
import { Validator } from "types/form";
import { createForm } from "utils/form";

export const WELCOME_FORM_VALIDATIONS = new Map<string, Validator>([
  [
    "email",
    (answer: string) => {
      const regex = /\S+@\S+\.\S+/;
      return {
        message: "El e-mail debe tener el formato email@domain.com",
        valid: regex.test(answer),
      };
    },
  ],
  [
    "date",
    (answer: string) => {
      const regex =
        /^(0?[1-9]|[12][0-9]|3[01])([/-])(0?[1-9]|1[012])\2(\d{4})$/;
      return {
        message: "La fecha debe tener el formato dd/mm/aaaa",
        valid: regex.test(answer),
      };
    },
  ],
]);

export const initWelcomeForm = (user: User) =>
  createForm(
    user.id,
    "Formulario de entrada",
    "Bienvenido a 42nd R.T.F. A continuación, te haremos unas preguntas para conocerte mejor y una vez comprueben tus respuestas, te daremos acceso al servidor. **Las preguntas se deben responder directamente al bot.**",
    [
      {
        id: "1",
        type: "text",
        question: "Indica tu e-mail.",
        validators: ["email"],
      },
      {
        id: "2",
        type: "text",
        question: "Indica tu usuario de steam.",
      },
      {
        id: "3",
        type: "text",
        question: "Indica tu fecha de nacimiento.",
        validators: ["date"],
      },
      {
        id: "4",
        type: "text",
        question:
          "Indica el apodo con el que deseas ser conocido/jugar (Jugamos como US RANGER. Debe ser un apellido de cualquier origen, nombre y apellido de cualquier origen o un apodo. Elijas la opción que elijas estará pendiente de aprobación.)",
      },
      {
        id: "5",
        type: "select",
        question: "¿Tienes experiencia en ARMA3?",
        options: [
          {
            emoji: "✅",
            text: "Sí",
          },
          {
            emoji: "❌",
            text: "No",
          },
        ],
      },
      {
        id: "6",
        type: "text",
        question: "¿Has jugado en algún clan anteriormente? Si es así, ¿cuál?",
      },
      {
        id: "7",
        type: "text",
        question:
          "¿Existe alguna especialidad dentro de ARMA3 que se te de bien o a la que aspiras? Si es así, indícala.",
      },
      {
        id: "8",
        type: "select",
        question: "¿Tienes experiencia en desarrollo de mods en ARMA 3?",
        options: [
          {
            emoji: "✅",
            text: "Sí",
          },
          {
            emoji: "❌",
            text: "No",
          },
        ],
      },
      {
        id: "9",
        type: "text",
        question:
          "¿Tienes experiencia en modelado 3D, texturizado, programación o edición de video?",
      },
      {
        id: "10",
        type: "text",
        question:
          "¿Cómo nos has conocido? (Si has sido invitado por algún miembro, indícalo)",
      },
      {
        id: "11",
        type: "text",
        question: "¿Estás en activo en otro clan? De ser afirmativo ¿Cual?",
      },
      {
        id: "12",
        type: "text",
        question:
          "¿Podrás mantener una asistencia aceptable los domingos de partida? 19:00-22:00",
      },
    ]
  );
