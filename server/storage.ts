import { scores, type InsertScore, type Score } from "@shared/schema";
import { db } from "./db";
import { asc, gte, lte, and } from "drizzle-orm";

export type TimePeriod = 'today' | 'week' | 'month' | 'all';

export interface IStorage {
  createScore(score: InsertScore): Promise<Score>;
  getTopScores(limit?: number): Promise<Score[]>;
  getAllScores(): Promise<Score[]>;
  getScoresByPeriod(period: TimePeriod): Promise<Score[]>;
}

function getDateRange(period: TimePeriod): { start: Date; end: Date } | null {
  const now = new Date();
  const end = now;
  
  switch (period) {
    case 'today':
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      return { start: todayStart, end };
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: weekAgo, end };
    case 'month':
      const monthAgo = new Date(now);
      monthAgo.setUTCMonth(monthAgo.getUTCMonth() - 1);
      return { start: monthAgo, end };
    case 'all':
    default:
      return null;
  }
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

  async getScoresByPeriod(period: TimePeriod): Promise<Score[]> {
    const range = getDateRange(period);
    
    if (!range) {
      return this.getAllScores();
    }
    
    return db.select()
      .from(scores)
      .where(and(
        gte(scores.createdAt, range.start),
        lte(scores.createdAt, range.end)
      ))
      .orderBy(asc(scores.score));
  }
}

export const storage = new DatabaseStorage();
