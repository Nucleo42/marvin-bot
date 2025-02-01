import { container } from "tsyringe";
import { MemberWelcomeService } from "@services/events/MemberWelcomeService";
import { CreateCanvasCardService } from "@services/events/CreateCanvasCardService";
import { MemberLeaveService } from "@services/events/MemberLeaveService";
import { ListenIntroductoryService } from "@services/events/ListenIntroductoryService";
import { AddMemberOnBanService } from "@services/events/AddMemberOnBanListServicee";

container.registerSingleton(MemberWelcomeService, MemberWelcomeService);
container.registerSingleton(CreateCanvasCardService, CreateCanvasCardService);
container.registerSingleton(MemberLeaveService, MemberLeaveService);
container.register(ListenIntroductoryService, ListenIntroductoryService);
container.register(AddMemberOnBanService, AddMemberOnBanService);
