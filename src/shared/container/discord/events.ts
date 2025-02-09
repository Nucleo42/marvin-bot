import { container } from "tsyringe";
import { MemberWelcomeService } from "@services/events/MemberWelcomeService";
import { CreateCanvasCardService } from "@services/events/CreateCanvasCardService";
import { MemberLeaveService } from "@services/events/MemberLeaveService";
import { IntroductionListenerService } from "@services/events/IntroductionListenerService";
import { AddMemberOnBanService } from "@services/events/AddMemberOnBanListService";
import { BotStatusService } from "@services/events/BotStatusService";
import { AnnouncementReactService } from "@services/events/AnnouncementReactService";

container.registerSingleton(MemberWelcomeService, MemberWelcomeService);
container.registerSingleton(CreateCanvasCardService, CreateCanvasCardService);
container.registerSingleton(MemberLeaveService, MemberLeaveService);
container.register(IntroductionListenerService, IntroductionListenerService);
container.register(AddMemberOnBanService, AddMemberOnBanService);
container.register(BotStatusService, BotStatusService);
container.register(AnnouncementReactService, AnnouncementReactService);
