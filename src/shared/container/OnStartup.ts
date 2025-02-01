import { LoadCacheOnStartup } from "@services/LoadCacheOnStartup";
import { BanMemberJob } from "@infrastructure/jobs/BanMemberJob";
import { container } from "tsyringe";

container.registerSingleton(LoadCacheOnStartup, LoadCacheOnStartup);
container.registerSingleton(BanMemberJob, BanMemberJob);
