import { BanMemberJob } from "@infrastructure/jobs/BanMemberJob";
import { GreetingJob } from "./GreetingJob";
import { injectable, inject } from "tsyringe";

@injectable()
export class JobsStart {
  constructor(
    @inject(BanMemberJob) private banMemberJob: BanMemberJob,
    @inject(GreetingJob) private greetingJob: GreetingJob,
  ) {}

  start() {
    this.banMemberJob.start();
    this.greetingJob.start();
  }
}
