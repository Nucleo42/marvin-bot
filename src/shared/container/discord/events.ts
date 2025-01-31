import { container } from "tsyringe";
import { MemberWelcomeService } from "@services/events/MemberWelcomeService";
import { CreateCanvasCardService } from "@services/events/CreateCanvasCardService";

container.registerSingleton(MemberWelcomeService, MemberWelcomeService);
container.registerSingleton(CreateCanvasCardService, CreateCanvasCardService);
