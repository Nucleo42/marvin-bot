import { container } from "tsyringe";
import { DatabaseConnection } from "@database/Connection";
import { ServerEventFlow } from "@database/repositories/ServerEventFlow.repository";

container.registerSingleton(DatabaseConnection, DatabaseConnection);
container.register(ServerEventFlow, ServerEventFlow);
