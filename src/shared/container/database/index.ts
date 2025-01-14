import { container } from "tsyringe";
import { DatabaseConnection } from "@database/connection";

container.registerSingleton(DatabaseConnection, DatabaseConnection);
