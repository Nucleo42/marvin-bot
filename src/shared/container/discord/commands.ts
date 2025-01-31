import { PingService } from "@services/commands/PingService";
import { SetWelcomeChannelService } from "@services/commands/SetWelcomeChannelService";
import { container } from "tsyringe";

container.registerSingleton(PingService, PingService);
container.registerSingleton(SetWelcomeChannelService, SetWelcomeChannelService);
