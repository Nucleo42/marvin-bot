import { container } from "tsyringe";
import { PingService } from "@services/commands/PingService";
import { SetWelcomeChannelService } from "@services/commands/SetWelcomeChannelService";
import { AutoBanService } from "@services/commands/AutoBanService";
import { SetGreetingService } from "@services/commands/SetGreetingService";
import { MemberCountService } from "@services/commands/MemberCountService";

import { SetAnnouncementReactService } from "@services/commands/SetAnnouncementReactService";

container.register(PingService, PingService);
container.register(SetWelcomeChannelService, SetWelcomeChannelService);
container.register(AutoBanService, AutoBanService);
container.register(SetGreetingService, SetGreetingService);
container.register(MemberCountService, MemberCountService);
container.register(SetAnnouncementReactService, SetAnnouncementReactService);
