import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
  registerFont,
} from "canvas";
import path from "path";

const base = "../assets/fonts";

const righteous = path.join(__dirname, base, "Righteous-Regular.ttf");
const poppinsBold = path.join(__dirname, base, "Poppins-Bold.ttf");
const poppinsRegular = path.join(__dirname, base, "Poppins-Regular.ttf");

export class ProfileCardCanvas {
  private canvas: Canvas;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number = 600, height: number = 150) {
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    registerFont(righteous, { family: "Righteous" });
    registerFont(poppinsBold, { family: "Poppins", weight: "bold" });
    registerFont(poppinsRegular, { family: "Poppins", weight: "regular" });
  }

  private async drawBackgroundImage(imagePath: string) {
    try {
      const backgroundImage = await loadImage(imagePath);
      this.ctx.drawImage(
        backgroundImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    } catch (error) {
      console.error("Error loading background image:", error);
    }
  }

  private async drawAvatar(
    avatarUrl: string,
    x: number,
    y: number,
    size: number,
  ) {
    try {
      const avatar = await loadImage(avatarUrl);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size / 2 + 5, 0, Math.PI * 2);
      this.ctx.fillStyle = "#6D28D9";
      this.ctx.fill();
      this.ctx.clip();

      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      this.ctx.clip();
      this.ctx.drawImage(avatar, x, y, size, size);
      this.ctx.restore();
    } catch (error) {
      console.error("Error loading avatar:", error);
      this.ctx.fillStyle = "#4A5568";
      this.ctx.beginPath();
      this.ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawBadge(
    text: string,
    x: number,
    y: number,
    isGreen: boolean = false,
  ) {
    const padding = 8;
    const fontSize = 14;
    const borderRadius = 4;

    this.ctx.font = `${fontSize}px Poppins`;
    const textMetrics = this.ctx.measureText(text);
    const width = textMetrics.width + padding * 2;
    const height = fontSize + padding - 2 * 1.5;

    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, borderRadius);
    this.ctx.fillStyle = isGreen ? "#059669" : "#B22222";
    this.ctx.fill();

    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(text, x + padding, y + (height + fontSize) / 2 - 1);
    return width;
  }

  private drawCommunityText(avatarY: number) {
    this.ctx.font = "bold 30px Righteous";
    this.ctx.fillStyle = "#D6AEF3";

    const line1 = "Nucleo 42";
    const line2 = "Community";

    const metrics1 = this.ctx.measureText(line1);
    const metrics2 = this.ctx.measureText(line2);

    const maxWidth = Math.max(metrics1.width, metrics2.width);

    const margin = 20;
    const x1 = this.canvas.width - maxWidth - margin;
    const x2 = this.canvas.width - maxWidth - margin;

    const y1 = avatarY + 35;
    const y2 = y1 + 25;

    this.ctx.fillText(line1, x1, y1);
    this.ctx.fillText(line2, x2, y2);
  }

  async drawCard({
    username,
    handle,
    statusText,
    avatarPath,
    backgroundPath,
    isGreen = true,
  }: {
    username: string;
    handle: string;
    statusText: string;
    avatarPath: string;
    backgroundPath: string;
    isGreen?: boolean;
  }) {
    await this.drawBackgroundImage(backgroundPath);

    const avatarX = 20;
    const avatarY = 35;
    const avatarSize = 80;
    const textStartX = 120;

    await this.drawAvatar(avatarPath, avatarX, avatarY, avatarSize);

    this.drawCommunityText(avatarY);

    if (statusText) {
      this.drawBadge(statusText, textStartX, 25, isGreen);
    }

    this.ctx.font = "bold 24px Poppins";
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(username, textStartX, 83);

    this.ctx.font = "16px Poppins";
    this.ctx.fillStyle = "#6B7280";
    this.ctx.fillText(`@${handle}`, textStartX, 115);
  }

  getBuffer(): Buffer {
    return this.canvas.toBuffer("image/png");
  }
}
