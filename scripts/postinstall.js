// Postinstall script для генерации Prisma Client
// Работает только если DATABASE_URL установлен (для продакшена)
if (process.env.DATABASE_URL) {
  const { execSync } = require('child_process')
  try {
    console.log('Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
  } catch (error) {
    console.warn('Warning: Prisma Client generation failed, but continuing...')
    console.warn(error.message)
  }
} else {
  console.log('Skipping Prisma Client generation (DATABASE_URL not set)')
}
