import { BanMemberJob } from "@infrastructure/jobs/BanMemberJob";
import { GreetingJob } from "./GreetingJob";

import { injectable, inject } from "tsyringe";
import { MemberCountJob } from "./MemberCountJob";

@injectable()
export class JobsStart {
  constructor(
    @inject(BanMemberJob) private banMemberJob: BanMemberJob,
    @inject(GreetingJob) private greetingJob: GreetingJob,
    @inject(MemberCountJob) private memberCountJob: MemberCountJob,
  ) {}

  start() {
    this.banMemberJob.start();
    this.greetingJob.start();
    this.memberCountJob.start();
  }
}
