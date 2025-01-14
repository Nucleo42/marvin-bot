import { ClientEvents } from "discord.js";

export type EventTypes<Key extends keyof ClientEvents> = {
  name: Key;
  once?: boolean;
  execute: (...args: ClientEvents[Key]) => void;
};

export class Event<Key extends keyof ClientEvents> {
  constructor(public event: EventTypes<Key>) {
    Object.assign(this, event);
  }
}
