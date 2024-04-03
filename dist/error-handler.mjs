import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";

// src/error-handler.ts
import { ZodError } from "zod";
var errorHandler = (error, req, res) => {
  if (error instanceof ZodError) {
    return res.status(400).send({
      message: "Erro durante valida\xE7\xE3o",
      errors: error.flatten().fieldErrors
    });
  }
  if (error instanceof BadRequest) {
    return res.status(400).send({ message: error.message });
  }
  return res.status(500).send({ message: error.message });
};
export {
  errorHandler
};
