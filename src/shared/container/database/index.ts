import { container } from "tsyringe";
import { DatabaseConnection } from "@database/connection";
import { ServerEventFlow } from "@database/repositories/ServerEventFlow.repository";

container.registerSingleton(DatabaseConnection, DatabaseConnection);
container.register(ServerEventFlow, ServerEventFlow);
