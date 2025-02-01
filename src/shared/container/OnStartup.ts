import { LoadCacheOnStartup } from "@services/LoadCacheOnStartup";
import { container } from "tsyringe";

container.registerSingleton(LoadCacheOnStartup);
