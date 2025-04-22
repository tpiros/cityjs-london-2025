import { PrismaClient } from '@prisma/client';
import {
  subDays,
  addDays,
  eachMonthOfInterval,
  endOfMonth,
  eachWeekOfInterval,
  endOfWeek,
  format,
  setDate,
  differenceInDays,
  parseISO,
} from 'date-fns';

const prisma = new PrismaClient();

// --- Configuration ---
const TOTAL_EXPENSES_TARGET = 300;
const START_DATE_STR = '2024-01-01';
const END_DATE = new Date(); // Use current date - automatically gets today's date

const START_DATE = parseISO(START_DATE_STR);

// --- Categories & Merchants (keep the expanded lists from before) ---
const categories = [
  'food',
  'groceries',
  'transport',
  'shopping',
  'fashion',
  'electronics',
  'travel',
  'accommodation',
  'entertainment',
  'streaming',
  'gaming',
  'utilities',
  'internet',
  'phone',
  'rent',
  'mortgage',
  'salary',
  'freelance',
  'investment',
  'dividends',
  'education',
  'courses',
  'books',
  'health',
  'pharmacy',
  'doctor',
  'gym',
  'gifts',
  'charity',
  'insurance',
  'car',
  'fuel',
  'maintenance',
  'miscellaneous',
  'pets',
  'home improvement',
  'dining out',
  'coffee',
  'takeaway',
];

const merchants = [
  'McDonalds',
  'KFC',
  'Burger King',
  'Subway',
  'Starbucks',
  'Coffee Bean',
  'Toast Box',
  'Ya Kun Kaya Toast',
  'Local Hawker Stall',
  'Food Court', // Added generic food
  'Uber Eats',
  'Foodpanda',
  'Deliveroo',
  'GrabFood',
  'Dominos',
  'Pizza Hut',
  'Grab Transport',
  'Go-Jek',
  'ComfortDelGro',
  'SMRT',
  'EZ-Link Topup',
  'Bus Ride', // Added generic transport
  'Shopee',
  'Lazada',
  'Qoo10',
  'Amazon',
  'Alibaba',
  'Carousell',
  'eBay',
  'FairPrice',
  'Sheng Siong',
  'Giant',
  'Cold Storage',
  'Don Don Donki',
  'IKEA',
  'Courts',
  'Harvey Norman',
  'Decathlon',
  'Uniqlo',
  'H&M',
  'Zara',
  'Nike',
  'Adidas',
  'Klook',
  'Trip.com',
  'Agoda',
  'Booking.com',
  'Expedia',
  'Singapore Airlines',
  'Scoot',
  'Jetstar',
  'AirAsia',
  'Cathay Pacific',
  'Emirates',
  'Netflix',
  'Disney+',
  'HBO Go',
  'Spotify',
  'Apple Music',
  'YouTube Premium',
  'Steam',
  'PlayStation Store',
  'Xbox Store',
  'Google Play',
  'Apple App Store',
  'Singtel',
  'StarHub',
  'M1',
  'Circles.Life',
  'MyRepublic',
  'ViewQwest',
  'PUB',
  'SP Services',
  'Geneco',
  'Keppel Electric',
  'HDB',
  'Condo Mgmt', // For Rent/Mortgage
  'DBS',
  'OCBC',
  'UOB',
  'Citibank',
  'Standard Chartered',
  'HSBC', // Banks for Salary/Investment
  'NTUC LearningHub',
  'Coursera',
  'Udemy',
  'Skillshare',
  'MasterClass',
  'National University Hospital',
  'Singapore General Hospital',
  'Tan Tock Seng Hospital',
  'Raffles Medical',
  'Guardian Pharmacy',
  'Watsons',
  'Unity Pharmacy',
  'Local Clinic', // Added generic health
  'Golden Village',
  'Cathay Cineplexes',
  'Shaw Theatres',
  'Mandai Wildlife Reserve',
  'Gardens by the Bay',
  'Resorts World Sentosa',
  'Marina Bay Sands',
  'Giga!',
  'Redmart',
  'iHerb',
  'Sephora',
  'Zalora',
  'SHEIN',
  'Cinema Ticket', // Added generic entertainment
  'Gifts & Presents',
  'Donation Centre', // Added generic gifts/charity
  'AXA Insurance',
  'Prudential',
  'NTUC Income', // Added insurance
];

// --- Helper Functions ---

function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get a random date within a specific month, biased towards a certain day
function getRandomDateInMonth(
  year: number,
  month: number,
  targetDay: number
): Date {
  const date = new Date(year, month, targetDay);
  const daysInMonth = endOfMonth(date).getDate();
  // Allow +- 3 days variation, staying within the month
  const randomDay = Math.max(
    1,
    Math.min(daysInMonth, targetDay + getRandomInt(-3, 3))
  );
  return setDate(date, randomDay);
}

// Get a random date within a specific week, biased towards a certain day of the week
function getRandomDateInWeek(
  weekStartDate: Date,
  targetDayOfWeek: number
): Date {
  let date = addDays(weekStartDate, targetDayOfWeek); // Target day
  // Allow +- 1 day variation
  date = addDays(date, getRandomInt(-1, 1));
  // Ensure it stays within the week if possible (simple check)
  if (date < weekStartDate) date = addDays(date, 2); // Adjust forward if variation pushed it back too much
  const weekEndDate = endOfWeek(weekStartDate);
  if (date > weekEndDate) date = subDays(date, 2); // Adjust backward
  return date;
}

// Select a random element from an array
function getRandomElement<T>(arr: T[]): T {
  if (!arr || arr.length === 0) {
    throw new Error('Cannot select random element from empty or null array');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Main Seeding Function ---
async function main() {
  console.log('🌱 Seeding database with realistic patterns...');
  console.log(
    `📅 Generating data from ${format(START_DATE, 'yyyy-MM-dd')} to ${format(
      END_DATE,
      'yyyy-MM-dd'
    )}`
  );

  // --- Database Setup ---
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.merchant.deleteMany();
  console.log('🧹 Cleared existing data.');

  const categoryRecords = await Promise.all(
    categories.map((name) => prisma.category.create({ data: { name } }))
  );
  console.log(`🛍️ Inserted ${categoryRecords.length} categories.`);
  const merchantRecords = await Promise.all(
    merchants.map((name) => prisma.merchant.create({ data: { name } }))
  );
  console.log(`🏪 Inserted ${merchantRecords.length} merchants.`);

  const categoryMap = new Map(categoryRecords.map((c) => [c.name, c.id]));
  const merchantMap = new Map(merchantRecords.map((m) => [m.name, m.id]));

  const getCategoryId = (name: string): string => {
    const id = categoryMap.get(name);
    if (!id) throw new Error(`Category ID not found for: ${name}`);
    return id;
  };
  const getMerchantId = (name: string): string => {
    const id = merchantMap.get(name);
    if (!id) throw new Error(`Merchant ID not found for: ${name}`);
    return id;
  };

  const generatedExpenses: Omit<ExpenseCreateInput, 'id'>[] = [];

  // --- Layer 1: Monthly Recurring Expenses ---
  console.log('⚙️ Generating Monthly Recurring Expenses...');
  const months = eachMonthOfInterval({ start: START_DATE, end: END_DATE });

  months.forEach((monthStart) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth(); // 0-indexed

    // a. Rent/Mortgage (Beginning of month)
    generatedExpenses.push({
      amount: getRandomNumber(2200, 3500), // Example range
      date: getRandomDateInMonth(year, month, 1),
      categoryId: getCategoryId('rent'), // or 'mortgage'
      merchantId: getRandomElement([
        getMerchantId('HDB'),
        getMerchantId('Condo Mgmt'),
      ]),
    });

    // b. Salary (End of month)
    generatedExpenses.push({
      amount: -getRandomNumber(4000, 7000), // Negative for income
      date: getRandomDateInMonth(year, month, 28),
      categoryId: getCategoryId('salary'),
      merchantId: getRandomElement([
        getMerchantId('DBS'),
        getMerchantId('OCBC'),
        getMerchantId('UOB'),
      ]),
    });

    // c. Subscriptions (Mid-month)
    generatedExpenses.push({
      amount: 17.98, // Netflix Premium (example)
      date: getRandomDateInMonth(year, month, 15),
      categoryId: getCategoryId('streaming'),
      merchantId: getMerchantId('Netflix'),
    });
    generatedExpenses.push({
      amount: 11.98, // Spotify Premium (example)
      date: getRandomDateInMonth(year, month, 18), // Slightly different day
      categoryId: getCategoryId('streaming'),
      merchantId: getMerchantId('Spotify'),
    });

    // d. Utilities (Later in month)
    generatedExpenses.push({
      amount: getRandomNumber(70, 180),
      date: getRandomDateInMonth(year, month, 22),
      categoryId: getCategoryId('utilities'),
      merchantId: getMerchantId('SP Services'), // Or others
    });

    // e. Phone Bill (Mid/Late month)
    generatedExpenses.push({
      amount: getRandomNumber(40, 90),
      date: getRandomDateInMonth(year, month, 20),
      categoryId: getCategoryId('phone'),
      merchantId: getRandomElement([
        getMerchantId('Singtel'),
        getMerchantId('StarHub'),
        getMerchantId('M1'),
        getMerchantId('Circles.Life'),
        getMerchantId('Giga!'),
      ]),
    });
  });
  console.log(`\tGenerated ${generatedExpenses.length} monthly expenses.`);

  // --- Layer 2: Weekly Recurring Expenses ---
  console.log('⚙️ Generating Weekly Recurring Expenses...');
  const weeks = eachWeekOfInterval(
    { start: START_DATE, end: END_DATE },
    { weekStartsOn: 1 }
  ); // Monday start
  const initialCount = generatedExpenses.length;

  weeks.forEach((weekStart) => {
    // Groceries (Weekend)
    generatedExpenses.push({
      amount: getRandomNumber(80, 160),
      date: getRandomDateInWeek(weekStart, 6), // Target Saturday (0=Sun, 6=Sat)
      categoryId: getCategoryId('groceries'),
      merchantId: getRandomElement([
        getMerchantId('FairPrice'),
        getMerchantId('Sheng Siong'),
        getMerchantId('Cold Storage'),
        getMerchantId('Redmart'),
        getMerchantId('Giant'),
      ]),
    });
  });
  console.log(
    `\tGenerated ${generatedExpenses.length - initialCount} weekly expenses.`
  );

  // --- Layer 3: High-Frequency Expenses (Food & Transport) ---
  console.log('⚙️ Generating High-Frequency Expenses...');
  let remainingSlots = TOTAL_EXPENSES_TARGET - generatedExpenses.length;
  if (remainingSlots <= 0) {
    console.warn(
      'WARN: Monthly/Weekly expenses already met or exceeded the target total. Consider increasing TOTAL_EXPENSES_TARGET.'
    );
    remainingSlots = 0;
  }

  const foodSlots = Math.max(10, Math.floor(remainingSlots * 0.55)); // Allocate ~55% to food
  const transportSlots = Math.max(5, Math.floor(remainingSlots * 0.25)); // Allocate ~25% to transport
  const highFrequencySlots = foodSlots + transportSlots;
  const totalDaysInRange = differenceInDays(END_DATE, START_DATE) + 1;

  console.log(
    `\tAllocating ~${foodSlots} slots for Food, ~${transportSlots} for Transport.`
  );

  // Food Merchants & Categories
  const foodMerchants = [
    'McDonalds',
    'KFC',
    'Subway',
    'Starbucks',
    'Coffee Bean',
    'Toast Box',
    'Ya Kun Kaya Toast',
    'Local Hawker Stall',
    'Food Court',
    'Uber Eats',
    'Foodpanda',
    'Deliveroo',
    'GrabFood',
    'Dominos',
    'Pizza Hut',
  ].map(getMerchantId);
  const foodCategories = ['food', 'dining out', 'coffee', 'takeaway'].map(
    getCategoryId
  );

  for (let i = 0; i < foodSlots; i++) {
    const randomDaysAgo = getRandomInt(0, totalDaysInRange - 1); // Days ago from END_DATE
    generatedExpenses.push({
      amount: getRandomNumber(5, 45), // Typical food/drink cost
      date: subDays(END_DATE, randomDaysAgo),
      categoryId: getRandomElement(foodCategories),
      merchantId: getRandomElement(foodMerchants),
    });
  }

  // Transport Merchants & Categories
  const transportMerchants = [
    'Grab Transport',
    'Go-Jek',
    'ComfortDelGro',
    'SMRT',
    'EZ-Link Topup',
    'Bus Ride',
  ].map(getMerchantId);
  const transportCategoryId = getCategoryId('transport');

  for (let i = 0; i < transportSlots; i++) {
    const randomDaysAgo = getRandomInt(0, totalDaysInRange - 1);
    generatedExpenses.push({
      amount: getRandomNumber(1.5, 25), // Typical transport cost
      date: subDays(END_DATE, randomDaysAgo),
      categoryId: transportCategoryId,
      merchantId: getRandomElement(transportMerchants),
    });
  }
  console.log(`\tGenerated ${highFrequencySlots} high-frequency expenses.`);

  // --- Layer 4: Irregular Expenses ---
  console.log('⚙️ Generating Irregular Expenses...');
  const irregularSlots = TOTAL_EXPENSES_TARGET - generatedExpenses.length;
  console.log(
    `\tAllocating remaining ~${irregularSlots} slots for Irregular expenses.`
  );

  const irregularCategories = categories
    .filter(
      (c) =>
        ![
          'rent',
          'mortgage',
          'salary',
          'streaming',
          'utilities',
          'phone',
          'groceries',
          'food',
          'dining out',
          'coffee',
          'takeaway',
          'transport',
        ].includes(c)
    )
    .map(getCategoryId);

  const irregularMerchants = merchants
    .filter(
      (m) =>
        ![
          'HDB',
          'Condo Mgmt',
          'DBS',
          'OCBC',
          'UOB', // Already used heavily for salary/rent
          'Netflix',
          'Spotify',
          'SP Services',
          'Singtel',
          'StarHub',
          'M1',
          'Circles.Life',
          'Giga!', // Monthly bills
          'FairPrice',
          'Sheng Siong',
          'Cold Storage',
          'Redmart',
          'Giant', // Groceries
          // High freq food/transport covered above
          'McDonalds',
          'KFC',
          'Subway',
          'Starbucks',
          'Coffee Bean',
          'Toast Box',
          'Ya Kun Kaya Toast',
          'Local Hawker Stall',
          'Food Court',
          'Uber Eats',
          'Foodpanda',
          'Deliveroo',
          'GrabFood',
          'Dominos',
          'Pizza Hut',
          'Grab Transport',
          'Go-Jek',
          'ComfortDelGro',
          'SMRT',
          'EZ-Link Topup',
          'Bus Ride',
        ].includes(m)
    )
    .map(getMerchantId);

  if (irregularCategories.length === 0 || irregularMerchants.length === 0) {
    console.warn(
      'WARN: Could not find sufficient distinct irregular categories or merchants.'
    );
  } else {
    for (let i = 0; i < irregularSlots; i++) {
      const randomDaysAgo = getRandomInt(0, totalDaysInRange - 1);
      const categoryId = getRandomElement(irregularCategories);

      const merchantId = getRandomElement(irregularMerchants);

      // Adjust amount based on category (simple example)
      let amount: number;
      const categoryName = categoryRecords.find(
        (c) => c.id === categoryId
      )?.name;
      if (
        [
          'travel',
          'electronics',
          'home improvement',
          'accommodation',
          'car',
        ].includes(categoryName || '')
      ) {
        amount = getRandomNumber(100, 800);
      } else if (
        [
          'shopping',
          'fashion',
          'gifts',
          'entertainment',
          'gaming',
          'books',
          'courses',
          'insurance',
        ].includes(categoryName || '')
      ) {
        amount = getRandomNumber(30, 250);
      } else if (
        ['health', 'pharmacy', 'doctor', 'gym', 'pets', 'maintenance'].includes(
          categoryName || ''
        )
      ) {
        amount = getRandomNumber(20, 150);
      } else {
        // miscellaneous, charity etc.
        amount = getRandomNumber(10, 100);
      }
      // Handle investment/dividend categories specifically if they are in irregular
      if (
        ['investment', 'dividends', 'freelance'].includes(categoryName || '')
      ) {
        amount = -getRandomNumber(50, 1000); // Make them income/outflow as appropriate
      }

      generatedExpenses.push({
        amount: parseFloat(amount.toFixed(2)),
        date: subDays(END_DATE, randomDaysAgo),
        categoryId: categoryId,
        merchantId: merchantId,
      });
    }
    console.log(`\tGenerated ${irregularSlots} irregular expenses.`);
  }

  // --- Final Insertion ---
  console.log(
    `💸 Total generated expenses: ${generatedExpenses.length} (Target: ${TOTAL_EXPENSES_TARGET})`
  );
  console.log('💾 Inserting expenses into database...');

  // Prisma's `createMany` is generally faster for large inserts
  // Ensure your database provider supports it well.
  try {
    const result = await prisma.expense.createMany({
      data: generatedExpenses,
      skipDuplicates: true, // Optional: In case unlikely duplicate dates/details occur
    });
    console.log(`💾 Successfully inserted ${result.count} expense records.`);
  } catch (error) {
    console.error('Error during bulk expense insertion:', error);
    // Optional: Add fallback to individual inserts if createMany fails
  }

  console.log('✅ Done seeding!');
}

// --- Run the Seeding ---
main()
  .catch((e) => {
    console.error('Unhandled error in main function:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  });

// Define ExpenseCreateInput type based on your Prisma schema (simplified)
// You might need to adjust this based on your actual schema.prisma definition
type ExpenseCreateInput = {
  id?: string; // Optional if auto-generated
  amount: number;
  date: Date;
  categoryId: string;
  merchantId: string;
  // Add other fields from your Expense model if necessary
  createdAt?: Date;
  updatedAt?: Date;
};
