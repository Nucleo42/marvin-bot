import { CacheType, Client, CommandInteraction, Guild } from "discord.js";
import { injectable } from "tsyringe";

type IPermissionService = CommandInteraction<CacheType> | Client<true>;

@injectable()
export class AdminPermissionService {
  private readonly ADMIN_ROLE_NAMES = [
    "admin",
    "administrator",
    "administrador",
  ];

  public async hasPermission(data: IPermissionService): Promise<boolean> {
    if (!(data instanceof CommandInteraction)) {
      return false;
    }

    const hasAdminPermission =
      data.memberPermissions?.has("Administrator") ?? false;
    if (hasAdminPermission) {
      return true;
    }

    const guild = data.guild;
    if (!guild) {
      return false;
    }

    const hasAdminRoles = this.checkAdminRolesExist(guild);
    if (!hasAdminRoles) {
      return true;
    }

    return this.checkUserHasAdminRole(guild, data.user.id);
  }

  private checkAdminRolesExist(guild: Guild): boolean {
    return this.ADMIN_ROLE_NAMES.some((roleName) =>
      guild.roles.cache.find((role) => role.name.toLowerCase() === roleName),
    );
  }

  private async checkUserHasAdminRole(
    guild: Guild,
    userId: string,
  ): Promise<boolean> {
    const user = await guild.members.fetch(userId);
    const adminRoles = user?.roles.cache.filter((role) =>
      this.ADMIN_ROLE_NAMES.includes(role.name.toLowerCase()),
    );

    return adminRoles?.size > 0;
  }
}
