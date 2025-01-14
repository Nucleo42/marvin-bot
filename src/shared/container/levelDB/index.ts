import { container } from "tsyringe";
import { LevelDB } from "@storage/level/client";

container.register("dbPath", {
  useValue: "./src/infrastructure/storage/.local",
});
container.registerSingleton(LevelDB, LevelDB);
