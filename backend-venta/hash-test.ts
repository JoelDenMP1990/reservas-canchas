import * as bcrypt from 'bcrypt';

async function hashPassword() {
  const plainPassword = 'Telconet2026**'; // no la hardcodees en prod
  const saltRounds = 10;

  const hash = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Hash:', hash);
}

hashPassword();


// npx ts-node hash-test.ts
