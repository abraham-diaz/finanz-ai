import { prisma } from "../index";
import { DEFAULT_USER_ID } from "../constants";

// Ensures the single default user row exists (id = DEFAULT_USER_ID). This app has no
// auth, so `password` is never checked — it's set to a placeholder to satisfy the schema.
async function main() {
  await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      userName: "default",
      password: "unused",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
