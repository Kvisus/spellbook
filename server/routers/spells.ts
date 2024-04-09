import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
export const spellsRouter = router({
  get: publicProcedure.query(async () => {
    const spells = await prisma.spell.findMany();
    return spells;
  }),
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        image: z.string(),
        spellbookId: z.number(),
      })
    )
    .mutation(async (options) => {
      const { input } = options;
      await prisma.spell.create({
        data: {
          title: input.title,
          description: input.description,
          image: input.image,
          spellbookId: input.spellbookId,
        },
      });
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.number(),
        image: z.string(),
      })
    )
    .mutation(async (options) => {
      const { input } = options;
      await prisma.spell.delete({
        where: {
          id: input.id,
        },
      });

      const imgPath = `public${input.image}`;

      try {
        // Проверяем наличие файла перед удалением
        await fs.access(imgPath, fs.constants.F_OK);
        // Удаляем файл изображения
        await fs.unlink(imgPath);
        console.log(`File ${imgPath} deleted successfully`);
      } catch (error: any) {
        if (error.code === "ENOENT") {
          console.error(`File ${imgPath} not found`);
        } else {
          console.error(`Error deleting file ${imgPath}: ${error}`);
        }
      }
    }),
});
