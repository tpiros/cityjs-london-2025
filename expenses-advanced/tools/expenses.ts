import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExpenses = {
  name: 'getExpenses',
  description: 'Get a summary of user expenses by category and date range.',
  parameters: z.object({
    category: z
      .string()
      .describe('Expense category, e.g., food, transport, shopping'),
    dateRange: z
      .object({
        start: z.string().describe('Start date in YYYY-MM-DD format'),
        end: z.string().describe('End date in YYYY-MM-DD format'),
      })
      .describe(
        'The resolved date range. Convert "last month", "yesterday", "this year" etc. to concrete dates.'
      ),
  }),
  execute: async ({
    category,
    dateRange,
  }: {
    category: string;
    dateRange: { start: string; end: string };
  }) => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    console.log({ startDate });
    console.log({ endDate });
    console.log({ category });

    // ✅ Step 1: Find category ID (or throw)
    let categoryIdFilter: string | undefined;

    if (category.toLowerCase() !== 'all') {
      const categoryRecord = await prisma.category.findUnique({
        where: { name: category.toLowerCase() },
      });

      if (!categoryRecord) {
        throw new Error(`Unknown category: ${category}`);
      }

      categoryIdFilter = categoryRecord.id;
    }

    // ✅ Step 2: Fetch matching expenses
    const expenses = await prisma.expense.findMany({
      where: {
        ...(categoryIdFilter && { categoryId: categoryIdFilter }),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        merchant: true,
      },
    });

    if (expenses.length === 0) {
      return {
        total: '0.00',
        count: 0,
        topMerchant: 'N/A',
      };
    }

    // ✅ Step 3: Aggregate totals
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const count = expenses.length;

    // ✅ Step 4: Find top merchant by frequency
    const merchantCount: Record<string, number> = {};
    for (const e of expenses) {
      const m = e.merchant.name;
      merchantCount[m] = (merchantCount[m] || 0) + 1;
    }

    const topMerchant =
      Object.entries(merchantCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      'N/A';

    return {
      total: total.toFixed(2),
      count,
      topMerchant,
    };
  },
};

export const getLatestExpense = {
  name: 'getLatestExpense',
  description: 'Get the most recent expense by category',
  parameters: z.object({
    category: z.string().describe('Expense category, e.g., food, transport'),
  }),
  execute: async ({ category }: { category: string }) => {
    let categoryIdFilter: string | undefined;

    if (category.toLowerCase() !== 'all') {
      const categoryRecord = await prisma.category.findUnique({
        where: { name: category.toLowerCase() },
      });

      if (!categoryRecord) {
        throw new Error(`Unknown category: ${category}`);
      }

      categoryIdFilter = categoryRecord.id;
    }

    const latest = await prisma.expense.findFirst({
      where: {
        ...(categoryIdFilter && { categoryId: categoryIdFilter }),
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        merchant: true,
      },
    });

    if (!latest) {
      return { found: false };
    }

    return {
      found: true,
      date: latest.date.toISOString(),
      amount: Number(latest.amount).toFixed(2),
      merchant: latest.merchant.name,
    };
  },
};
