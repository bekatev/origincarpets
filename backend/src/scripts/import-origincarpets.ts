declare const process: { argv: string[] } | undefined;

import { PrismaClient } from '@prisma/client';
import { syncOrigincarpetsProducts } from '../modules/admin/origincarpets-sync';

const prisma = new PrismaClient();

async function main() {
  const requestedMode = process?.argv?.[2] === 'full' ? 'full' : 'sync';
  console.log(`Running origincarpets import in "${requestedMode}" mode ...`);
  const result = await syncOrigincarpetsProducts(prisma, requestedMode);
  console.log(`Done. Imported: ${result.imported}, skipped: ${result.skipped}, fetched: ${result.totalFetched}`);
}

main()
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
