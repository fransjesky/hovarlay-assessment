import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

// Helper function to get random element from array
const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)] as T;

// Product name generators
const productAdjectives = [
  "Premium",
  "Classic",
  "Modern",
  "Vintage",
  "Deluxe",
  "Essential",
  "Professional",
  "Ultra",
  "Smart",
  "Eco",
];

const productNouns = [
  "Laptop",
  "Headphones",
  "Camera",
  "Watch",
  "Backpack",
  "Sneakers",
  "Jacket",
  "Chair",
  "Lamp",
  "Keyboard",
  "Monitor",
  "Tablet",
  "Speaker",
  "Wallet",
  "Sunglasses",
  "Bottle",
  "Notebook",
  "Charger",
  "Mouse",
  "Desk",
];

const generateProductName = (index: number): string => {
  const adjective = getRandomElement(productAdjectives);
  const noun = getRandomElement(productNouns);
  return `${adjective} ${noun} ${index}`;
};

const generateDescription = (name: string): string => {
  const descriptions = [
    `Discover the amazing ${name}. Built with quality materials and designed for everyday use.`,
    `The ${name} offers exceptional performance and style. Perfect for your daily needs.`,
    `Experience excellence with the ${name}. Crafted with attention to detail and durability.`,
    `Introducing the ${name} - your perfect companion for work and play.`,
    `The ${name} combines functionality with elegant design. A must-have item.`,
  ];
  return getRandomElement(descriptions);
};

async function main() {
  const DATA_COUNT: number = 1000;

  console.log("Seeding started...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log("Creating users...");
  const hashedPassword = await bcrypt.hash("password@2026", 10);

  const users = [];
  for (let i = 1; i <= DATA_COUNT; i++) {
    users.push({
      email: `user-${i}@hovarlay.com`,
      password: hashedPassword,
    });
  }

  await prisma.user.createMany({
    data: users,
  });
  console.log(`${DATA_COUNT} users created!`);

  // Create categories
  console.log("Creating categories...");
  const categoryList = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
    "Health",
    "Automotive",
    "Food",
    "Music",
  ];

  const categories = await Promise.all(
    categoryList.map((name) => prisma.category.create({ data: { name } })),
  );
  console.log(`${categoryList.length} categories created!`);

  // Create products
  console.log("Creating products...");
  for (let i = 1; i <= DATA_COUNT; i++) {
    const name = generateProductName(i);
    const price = Math.floor(Math.random() * 99000 + 1000) / 100; // $10.00 - $1000.00
    const rating = Math.floor(Math.random() * 41 + 10) / 10; // 1.0 - 5.0
    const inStock = Math.random() > 0.2; // 80% in stock

    // Random categories (1-3 per product)
    const numCategories = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    const productCategories = shuffled.slice(0, numCategories);

    // Random images (1-4 per product)
    const numImages = Math.floor(Math.random() * 4) + 1;
    const images = Array.from({ length: numImages }, (_, idx) => ({
      url: `https://picsum.photos/seed/${i * 10 + idx}/400/400`,
    }));

    await prisma.product.create({
      data: {
        name,
        description: generateDescription(name),
        price,
        rating,
        inStock,
        categories: {
          connect: productCategories.map((c) => ({ id: c.id })),
        },
        images: {
          create: images,
        },
      },
    });

    // Log progress every 100 products
    if (i % 100 === 0) {
      console.log(`Created ${i} products...`);
    }
  }

  console.log("Seeding completed!");
  console.log("---");
  console.log("Summary:");
  console.log(`- ${DATA_COUNT} users (email: user-1@hovarlay.com to user-${DATA_COUNT}@hovarlay.com)`);
  console.log("- Password for all users: password@2026");
  console.log(`- ${categoryList.length} categories`);
  console.log(`- ${DATA_COUNT} products with random images and categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
