import { AdminPermissionService } from "@services/AdminPermissionService";
import { container } from "tsyringe";

container.register(AdminPermissionService, AdminPermissionService);
