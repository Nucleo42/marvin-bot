import { container } from "tsyringe";
import { LevelDB } from "@storage/level/client";
import path from "path";
import { BASE_PATH } from "@constants/basePath";

container.register("dbPath", {
  useValue: path.resolve(BASE_PATH, "infrastructure/storage/.local"),
});
container.registerSingleton(LevelDB, LevelDB);
