import { container } from "tsyringe";
import { DatabaseConnection } from "@database/Connection";
import { ServerEventFlow } from "@database/repositories/ServerEventFlow.repository";
import { AutoBanRepository } from "@database/repositories/AutoBanRepository";
import { GreetingRepository } from "@database/repositories/GreetingRepository";

container.registerSingleton(DatabaseConnection, DatabaseConnection);
container.register(ServerEventFlow, ServerEventFlow);
container.register(AutoBanRepository, AutoBanRepository);
container.register(GreetingRepository, GreetingRepository);
