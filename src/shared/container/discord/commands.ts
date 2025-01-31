import { PingService } from "@services/commands/PingService";
import { SetWelcomeChannelService } from "@services/commands/SetWelcomeChannelService";
import { AutoBanService } from "@services/commands/AutoBanService";
import { container } from "tsyringe";

container.register(PingService, PingService);
container.register(SetWelcomeChannelService, SetWelcomeChannelService);
container.register(AutoBanService, AutoBanService);
