import { PingService } from "@services/commands/PingService";
import { container } from "tsyringe";

container.registerSingleton(PingService, PingService);
