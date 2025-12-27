import { scores, type InsertScore, type Score } from "@shared/schema";
import { db } from "./db";
import { asc } from "drizzle-orm";

export interface IStorage {
  createScore(score: InsertScore): Promise<Score>;
  getTopScores(limit?: number): Promise<Score[]>;
  getAllScores(): Promise<Score[]>;
}

export class DatabaseStorage implements IStorage {
  async createScore(insertScore: InsertScore): Promise<Score> {
    const [score] = await db.insert(scores).values(insertScore).returning();
    return score;
  }

  async getTopScores(limit = 10): Promise<Score[]> {
    return db.select()
      .from(scores)
      .orderBy(asc(scores.score))
      .limit(limit);
  }

  async getAllScores(): Promise<Score[]> {
    return db.select()
      .from(scores)
      .orderBy(asc(scores.score));
  }
}

export const storage = new DatabaseStorage();
