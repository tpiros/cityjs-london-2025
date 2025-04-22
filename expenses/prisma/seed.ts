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

const TOTAL_EXPENSES_TARGET = 300;
const START_DATE_STR = '2024-01-01';
const END_DATE = new Date();

const START_DATE = parseISO(START_DATE_STR);

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
  'Condo Mgmt',
  'DBS',
  'OCBC',
  'UOB',
  'Citibank',
  'Standard Chartered',
  'HSBC',
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
  'Local Clinic',
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
  'Cinema Ticket',
  'Gifts & Presents',
  'Donation Centre',
  'AXA Insurance',
  'Prudential',
  'NTUC Income',
];

function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDateInMonth(
  year: number,
  month: number,
  targetDay: number
): Date {
  const date = new Date(year, month, targetDay);
  const daysInMonth = endOfMonth(date).getDate();
  const randomDay = Math.max(
    1,
    Math.min(daysInMonth, targetDay + getRandomInt(-3, 3))
  );
  return setDate(date, randomDay);
}

function getRandomDateInWeek(
  weekStartDate: Date,
  targetDayOfWeek: number
): Date {
  let date = addDays(weekStartDate, targetDayOfWeek);
  date = addDays(date, getRandomInt(-1, 1));
  if (date < weekStartDate) date = addDays(date, 2);
  const weekEndDate = endOfWeek(weekStartDate);
  if (date > weekEndDate) date = subDays(date, 2);
  return date;
}

function getRandomElement<T>(arr: T[]): T {
  if (!arr || arr.length === 0) {
    throw new Error('Cannot select random element from empty or null array');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Seeding database with realistic patterns...');
  console.log(
    `📅 Generating data from ${format(START_DATE, 'yyyy-MM-dd')} to ${format(
      END_DATE,
      'yyyy-MM-dd'
    )}`
  );

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

  console.log('⚙️ Generating Monthly Recurring Expenses...');
  const months = eachMonthOfInterval({ start: START_DATE, end: END_DATE });

  months.forEach((monthStart) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();

    generatedExpenses.push({
      amount: getRandomNumber(2200, 3500),
      date: getRandomDateInMonth(year, month, 1),
      categoryId: getCategoryId('rent'),
      merchantId: getRandomElement([
        getMerchantId('HDB'),
        getMerchantId('Condo Mgmt'),
      ]),
    });

    generatedExpenses.push({
      amount: -getRandomNumber(4000, 7000),
      date: getRandomDateInMonth(year, month, 28),
      categoryId: getCategoryId('salary'),
      merchantId: getRandomElement([
        getMerchantId('DBS'),
        getMerchantId('OCBC'),
        getMerchantId('UOB'),
      ]),
    });

    generatedExpenses.push({
      amount: 17.98,
      date: getRandomDateInMonth(year, month, 15),
      categoryId: getCategoryId('streaming'),
      merchantId: getMerchantId('Netflix'),
    });
    generatedExpenses.push({
      amount: 11.98,
      date: getRandomDateInMonth(year, month, 18),
      categoryId: getCategoryId('streaming'),
      merchantId: getMerchantId('Spotify'),
    });

    generatedExpenses.push({
      amount: getRandomNumber(70, 180),
      date: getRandomDateInMonth(year, month, 22),
      categoryId: getCategoryId('utilities'),
      merchantId: getMerchantId('SP Services'),
    });

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

  console.log('⚙️ Generating Weekly Recurring Expenses...');
  const weeks = eachWeekOfInterval(
    { start: START_DATE, end: END_DATE },
    { weekStartsOn: 1 }
  );
  const initialCount = generatedExpenses.length;

  weeks.forEach((weekStart) => {
    generatedExpenses.push({
      amount: getRandomNumber(80, 160),
      date: getRandomDateInWeek(weekStart, 6),
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

  console.log('⚙️ Generating High-Frequency Expenses...');
  let remainingSlots = TOTAL_EXPENSES_TARGET - generatedExpenses.length;
  if (remainingSlots <= 0) {
    console.warn(
      'WARN: Monthly/Weekly expenses already met or exceeded the target total. Consider increasing TOTAL_EXPENSES_TARGET.'
    );
    remainingSlots = 0;
  }

  const foodSlots = Math.max(10, Math.floor(remainingSlots * 0.55));
  const transportSlots = Math.max(5, Math.floor(remainingSlots * 0.25));
  const highFrequencySlots = foodSlots + transportSlots;
  const totalDaysInRange = differenceInDays(END_DATE, START_DATE) + 1;

  console.log(
    `\tAllocating ~${foodSlots} slots for Food, ~${transportSlots} for Transport.`
  );

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
    const randomDaysAgo = getRandomInt(0, totalDaysInRange - 1);
    generatedExpenses.push({
      amount: getRandomNumber(5, 45),
      date: subDays(END_DATE, randomDaysAgo),
      categoryId: getRandomElement(foodCategories),
      merchantId: getRandomElement(foodMerchants),
    });
  }

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
      amount: getRandomNumber(1.5, 25),
      date: subDays(END_DATE, randomDaysAgo),
      categoryId: transportCategoryId,
      merchantId: getRandomElement(transportMerchants),
    });
  }
  console.log(`\tGenerated ${highFrequencySlots} high-frequency expenses.`);

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
          'UOB',
          'Netflix',
          'Spotify',
          'SP Services',
          'Singtel',
          'StarHub',
          'M1',
          'Circles.Life',
          'Giga!',
          'FairPrice',
          'Sheng Siong',
          'Cold Storage',
          'Redmart',
          'Giant',
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
        amount = getRandomNumber(10, 100);
      }
      if (
        ['investment', 'dividends', 'freelance'].includes(categoryName || '')
      ) {
        amount = -getRandomNumber(50, 1000);
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

  console.log(
    `💸 Total generated expenses: ${generatedExpenses.length} (Target: ${TOTAL_EXPENSES_TARGET})`
  );
  console.log('💾 Inserting expenses into database...');

  try {
    const result = await prisma.expense.createMany({
      data: generatedExpenses,
      skipDuplicates: true,
    });
    console.log(`💾 Successfully inserted ${result.count} expense records.`);
  } catch (error) {
    console.error('Error during bulk expense insertion:', error);
  }

  console.log('✅ Done seeding!');
}

main()
  .catch((e) => {
    console.error('Unhandled error in main function:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  });

type ExpenseCreateInput = {
  id?: string;
  amount: number;
  date: Date;
  categoryId: string;
  merchantId: string;
  createdAt?: Date;
  updatedAt?: Date;
};
