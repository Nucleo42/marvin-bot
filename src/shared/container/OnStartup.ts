import { LoadCacheOnStartup } from "@services/LoadCacheOnStartup";
import { BanMemberJob } from "@infrastructure/jobs/BanMemberJob";
import { JobsStart } from "@infrastructure/jobs";
import { GreetingJob } from "@infrastructure/jobs/GreetingJob";
import { container } from "tsyringe";

container.registerSingleton(LoadCacheOnStartup, LoadCacheOnStartup);
container.registerSingleton(BanMemberJob, BanMemberJob);
container.registerSingleton(JobsStart, JobsStart);
container.registerSingleton(GreetingJob, GreetingJob);
