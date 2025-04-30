import { CommandProps } from "@interfaces/discord/Command";
import { inject, injectable } from "tsyringe";
import {
  MessageFlags,
  ChannelType,
  PermissionFlagsBits,
  Guild,
  GuildMember,
  CommandInteraction,
  UserContextMenuCommandInteraction,
  APIInteractionGuildMember,
} from "discord.js";
import configs from "@configs/EnvironmentVariables";
import { Logger } from "@logging/Logger";
import { AdminPermissionService } from "@services/AdminPermissionService";
import { isDev } from "@utils/IsDev";

@injectable()
export class CreateDmChatService {
  private readonly dmFeatureConfig = configs.DM_MESSAGE_FEATURE;

  constructor(
    @inject(Logger) private logger: Logger,
    @inject(AdminPermissionService)
    private adminPermission: AdminPermissionService,
  ) {}

  public async execute({ interaction }: CommandProps) {
    if (!interaction.isUserContextMenuCommand()) {
      return;
    }

    try {
      if (!(await this.checkAdminPermissions(interaction))) {
        return;
      }

      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });

      const guild = interaction.guild;

      if (!guild) {
        throw new Error("Guild não encontrada");
      }

      const targetUser = this.getTargetUser(interaction);
      const parent = await this.findCategory(guild);
      const { adminRole, modRole } = await this.findRequiredRoles(guild);

      const channel = await this.createDmChannel(
        guild,
        targetUser,
        parent.id,
        adminRole.id,
        modRole.id,
        interaction.user.username,
      );

      await interaction.editReply({
        content: `DM criada com sucesso! \n\n acesse: ${channel}`,
      });
    } catch (error) {
      await this.handleError(interaction, error);
    }
  }

  private async checkAdminPermissions(interaction: CommandInteraction) {
    const isAdministrator =
      await this.adminPermission.hasPermission(interaction);

    if (!isAdministrator) {
      await interaction.reply({
        content: "Você não tem permissão para executar este comando!",
        flags: MessageFlags.Ephemeral,
      });
      return false;
    }

    return true;
  }

  private getTargetUser(interaction: UserContextMenuCommandInteraction) {
    const targetUser = interaction.targetMember;

    if (!targetUser) {
      throw new Error("Usuário não encontrado");
    }

    return targetUser;
  }

  private async findCategory(guild: Guild) {
    const parent = guild?.channels.cache.find(
      (channel) => channel.id === this.dmFeatureConfig.CATEGORY_ID,
    );

    if (!parent) {
      throw new Error("Não foi possível encontrar a categoria.");
    }

    if (parent.type !== ChannelType.GuildCategory) {
      throw new Error("O canal pai não é uma categoria.");
    }

    return parent;
  }

  private async findRequiredRoles(guild: Guild) {
    const { ADMIN_ROLE_NAME, MOD_ROLE_NAME } = this.dmFeatureConfig;

    const adminRole = guild?.roles.cache.find(
      (role) => role.name == ADMIN_ROLE_NAME,
    );

    const modRole = guild?.roles.cache.find(
      (role) => role.name == MOD_ROLE_NAME,
    );

    if (!adminRole || !modRole) {
      throw new Error("Não foi possível encontrar os cargos de admin ou mod");
    }

    return { adminRole, modRole };
  }

  private async createDmChannel(
    guild: Guild,
    targetUser: GuildMember | APIInteractionGuildMember,
    parentId: string,
    adminRoleId: string,
    modRoleId: string,
    creatorUsername: string,
  ) {
    return await guild?.channels.create({
      name: `🔒-dm-${targetUser?.user.username}`,
      parent: parentId,
      type: ChannelType.GuildText,
      permissionOverwrites: this.buildPermissionOverwrites(
        guild,
        targetUser,
        adminRoleId,
        modRoleId,
      ),
      position: 0,
      topic: `DM criada por ${creatorUsername} | Admins e Mods tem total acesso`,
    });
  }

  private buildPermissionOverwrites(
    guild: Guild,
    targetUser: GuildMember | APIInteractionGuildMember,
    adminRoleId: string,
    modRoleId: string,
  ) {
    return [
      {
        id: adminRoleId,
        allow: Object.values(PermissionFlagsBits),
      },
      {
        id: modRoleId,
        allow: Object.values(PermissionFlagsBits),
      },
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: targetUser?.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.SendMessages,
        ],
        deny: [
          PermissionFlagsBits.UseApplicationCommands,
          PermissionFlagsBits.SendPolls,
        ],
      },
    ];
  }

  private async handleError(
    interaction: UserContextMenuCommandInteraction,
    error: unknown,
  ) {
    if (isDev) {
      this.logger.error({
        prefix: "create-dm",
        message: `Erro ao criar DM: ${error}`,
      });
    }

    const message = "Ocorreu um erro ao criar o DM.";

    if (interaction.deferred) {
      await interaction.editReply({ content: message });
    } else {
      await interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
