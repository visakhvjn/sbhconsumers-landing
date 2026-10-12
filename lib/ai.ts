import "server-only";
import OpenAI from "openai";
import { Client } from "langsmith";
import { wrapOpenAI } from "langsmith/wrappers";

export const langsmith = new Client();

let client: ReturnType<typeof wrapOpenAI<OpenAI>> | undefined;

export function getOpenAI() {
  client ??= wrapOpenAI(new OpenAI(), { client: langsmith });
  return client;
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
