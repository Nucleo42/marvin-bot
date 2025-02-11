import {
  ActionRowBuilder,
  APIEmbedField,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
  ThreadChannel,
  TextChannel,
} from "discord.js";
import { injectable, inject } from "tsyringe";
import { getProjectSlotsGemini } from "@infrastructure/IA/GetProjectSlotsGemini";
import { LevelDB } from "@storage/level/Client";
import { Logger } from "@logging/Logger";
import { AnnouncementProjectRepository } from "@database/repositories/AnnouncementProjectRepository";
import { isDev } from "@utils/IsDev";
import { IAnnouncementProjectRepository } from "@database/repositories/AnnouncementProjectRepository";

@injectable()
export class AnnouncementProjectService {
  constructor(
    @inject(getProjectSlotsGemini)
    private projectSlotsGemini: getProjectSlotsGemini,
    @inject(LevelDB) private storage: LevelDB,
    @inject(Logger) private logger: Logger,
    @inject(AnnouncementProjectRepository)
    private db: AnnouncementProjectRepository,
  ) {}

  private async getAnnouncementConfig(guildId: string) {
    return await this.db.get(guildId);
  }

  private async getStorageData(guildId: string) {
    return await this.storage.getData<IAnnouncementProjectRepository>(
      "announcement-project",
      guildId,
    );
  }

  private async getConfigurations(guildId: string) {
    const storageData = await this.getStorageData(guildId);

    if (storageData) {
      if (isDev) {
        this.logger.debug({
          prefix: "discord-core-announcement-project",
          message: "Carregando configurações do storage!",
        });
      }
      return storageData;
    }

    const announcementConfig = await this.getAnnouncementConfig(guildId);

    if (announcementConfig.length === 0) return null;

    return announcementConfig[0] as IAnnouncementProjectRepository;
  }

  private async replaceRoleMentions(message: Message): Promise<string> {
    let content = message.content;
    for (const role of message.mentions.roles.values()) {
      content = content.replace(
        new RegExp(`<@&${role.id}>`, "g"),
        `@${role.name}`,
      );
    }
    return content;
  }

  private createEmbed(
    threadName: string,
    embedSlots: string,
    isAffirmative: boolean | string,
    affirmativeType: string | null,
  ): EmbedBuilder {
    const fields: APIEmbedField[] = [
      {
        name: "🏷 Nome da Postagem",
        value: threadName,
        inline: false,
      },
      {
        name: "📌 Vagas por Área",
        value: embedSlots,
        inline: false,
      },
    ];

    if (isAffirmative && affirmativeType) {
      fields.push({
        name: "👩‍💻 Contem Vagas Afirmativa para",
        value: `🔹 ${affirmativeType}`,
        inline: true,
      });
    }

    /* fields.push({
      name: "📢 Notificação",
      value: mentionsMessage || "Nenhum",
      inline: false,
    }); */

    return new EmbedBuilder()
      .setTitle("🚀 Novo Projeto Criado!")
      .setDescription("Um novo projeto foi postado no fórum!")
      .setColor(0x00ff00)
      .addFields(fields)
      .setTimestamp();
  }

  private createButton(messageUrl: string): ActionRowBuilder<ButtonBuilder> {
    const button = new ButtonBuilder({
      label: "Acessar",
      url: messageUrl,
      style: ButtonStyle.Link,
    });

    return new ActionRowBuilder<ButtonBuilder>({
      components: [button],
    });
  }

  private isValidThread(
    thread: ThreadChannel,
    forum_thread_to_listen: string,
  ): boolean {
    return thread.isThread() && thread.parentId === forum_thread_to_listen;
  }

  private async getFirstMessage(
    thread: ThreadChannel,
  ): Promise<Message | null> {
    const post = await thread.messages.fetch({ limit: 1 });
    return post.first() || null;
  }

  private async processMessageReaction(message: Message): Promise<void> {
    await message.react("💜");
  }

  private getAnnouncementChannel(
    thread: ThreadChannel,
    announcementChannel: string,
  ): TextChannel | null {
    const channel = thread.guild?.channels.cache.get(announcementChannel);
    return channel?.isTextBased() ? (channel as TextChannel) : null;
  }

  private async processProjectSlots(content: string, message: Message) {
    const projectSlots = await this.projectSlotsGemini.get(content);
    if (!projectSlots) return null;

    let embedSlots = "";
    let mentionsMessage = "";

    projectSlots.slots.forEach((slot) => {
      embedSlots += `🔹 ${slot.name}: ${slot.qtd}\n`;
      const role = message.guild?.roles.cache.find((role) =>
        role.name.toLowerCase().includes(slot.name.toLowerCase()),
      );
      mentionsMessage += role?.toString() + " ";
    });

    return {
      embedSlots,
      mentionsMessage,
      isAffirmative: projectSlots.isAffirmative,
      affirmativeType: projectSlots.affirmativeType,
    };
  }

  private async createAndSendAnnouncement(
    thread: ThreadChannel,
    message: Message,
    announcementChannel: TextChannel,
    processedSlots: {
      embedSlots: string;
      mentionsMessage: string;
      isAffirmative: boolean | string;
      affirmativeType: string | null;
    },
  ): Promise<Message<true>> {
    const embed = this.createEmbed(
      thread.name,
      processedSlots.embedSlots,
      processedSlots.isAffirmative,
      processedSlots.affirmativeType,
    );

    // processedSlots.mentionsMessage,

    const components = this.createButton(message.url);

    const sendAnnouncement = await announcementChannel.send({
      content: `||${processedSlots.mentionsMessage}||`,
      components: [components],
      embeds: [embed],
    });

    return sendAnnouncement;
  }

  public async execute(thread: ThreadChannel): Promise<void> {
    const configurations = await this.getConfigurations(thread.guildId);

    if (!configurations || !configurations.enabled) return;

    const { forum_thread_to_listen, channel_to_send } = configurations;

    if (!forum_thread_to_listen || !channel_to_send) return;

    if (!this.isValidThread(thread, forum_thread_to_listen)) return;

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-announcement-project",
        message: "Foi detectado um novo projeto!",
      });
    }

    const message = await this.getFirstMessage(thread);
    if (!message) return;

    await this.processMessageReaction(message);

    const announcementChannel = this.getAnnouncementChannel(
      thread,
      channel_to_send,
    );
    if (!announcementChannel) return;

    const content = await this.replaceRoleMentions(message);
    const processedSlots = await this.processProjectSlots(content, message);
    if (!processedSlots) return;

    const announcement = await this.createAndSendAnnouncement(
      thread,
      message,
      announcementChannel,
      processedSlots,
    );

    await this.processMessageReaction(announcement);

    if (isDev) {
      this.logger.debug({
        prefix: "discord-core-announcement-project",
        message: "Foi enviado o anúncio do projeto!",
      });
    }
  }
}
