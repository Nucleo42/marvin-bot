import { container } from "tsyringe";
import { DatabaseConnection } from "@database/Connection";
import { ServerEventFlow } from "@database/repositories/ServerEventFlow.repository";
import { AutoBanRepository } from "@database/repositories/AutoBanRepository";

container.registerSingleton(DatabaseConnection, DatabaseConnection);
container.register(ServerEventFlow, ServerEventFlow);
container.register(AutoBanRepository, AutoBanRepository);
