import { container } from "tsyringe";
import { LevelDB } from "@storage/level/Client";
import path from "path";
import { BASE_PATH } from "@constants/BasePath";

container.register("dbPath", {
  useValue: path.resolve(BASE_PATH, "../.local"),
});
container.registerSingleton(LevelDB, LevelDB);
