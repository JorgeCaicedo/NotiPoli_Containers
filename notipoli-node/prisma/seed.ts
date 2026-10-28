// notipoli-node/prisma/seed.ts
import { PrismaClient, UserRole, NewsStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@notipoli.com' },
    update: {},
    create: {
      email: 'admin@notipoli.com',
      passwordHash,
      name: 'Administrador',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create editor user
  const editor = await prisma.user.upsert({
    where: { email: 'editor@notipoli.com' },
    update: {},
    create: {
      email: 'editor@notipoli.com',
      passwordHash,
      name: 'Editor',
      role: UserRole.EDITOR,
      isActive: true,
    },
  })
  console.log('✅ Editor user created:', editor.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'seguridad' },
      update: {},
      create: { name: 'Seguridad', slug: 'seguridad', description: 'Noticias de seguridad pública', color: '#DC2626' },
    }),
    prisma.category.upsert({
      where: { slug: 'tecnologia' },
      update: {},
      create: { name: 'Tecnología', slug: 'tecnologia', description: 'Avances tecnológicos', color: '#2563EB' },
    }),
    prisma.category.upsert({
      where: { slug: 'capacitacion' },
      update: {},
      create: { name: 'Capacitación', slug: 'capacitacion', description: 'Cursos y entrenamientos', color: '#16A34A' },
    }),
    prisma.category.upsert({
      where: { slug: 'normativa' },
      update: {},
      create: { name: 'Normativa', slug: 'normativa', description: 'Leyes y reglamentos', color: '#9333EA' },
    }),
  ])
  console.log('✅ Categories created:', categories.length)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'policia' }, update: {}, create: { name: 'Policía', slug: 'policia' } }),
    prisma.tag.upsert({ where: { slug: 'prevencion' }, update: {}, create: { name: 'Prevención', slug: 'prevencion' } }),
    prisma.tag.upsert({ where: { slug: 'operativo' }, update: {}, create: { name: 'Operativo', slug: 'operativo' } }),
    prisma.tag.upsert({ where: { slug: 'comunidad' }, update: {}, create: { name: 'Comunidad', slug: 'comunidad' } }),
  ])
  console.log('✅ Tags created:', tags.length)

  // Create sample news
  const news1 = await prisma.news.upsert({
    where: { slug: 'bienvenidos-a-notipoli' },
    update: {},
    create: {
      title: 'Bienvenidos a NotiPoli',
      slug: 'bienvenidos-a-notipoli',
      excerpt: 'Lanzamos la nueva plataforma de comunicación para la comunidad policial.',
      content: `
        <h2>Bienvenidos a NotiPoli</h2>
        <p>Nos complace anunciar el lanzamiento de <strong>NotiPoli</strong>, la nueva plataforma de noticias y comunicación diseñada específicamente para la comunidad policial.</p>
        <h3>¿Qué encontrarás aquí?</h3>
        <ul>
          <li>Noticias actualizadas sobre seguridad pública</li>
          <li>Información sobre capacitaciones y cursos</li>
          <li>Novedades normativas y legales</li>
          <li>Tecnología aplicada a la seguridad</li>
        </ul>
        <p>Mantente informado con las últimas novedades relevantes para tu labor diaria.</p>
      `,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
      categories: {
        create: [
          { categoryId: categories[0].id }, // Seguridad
          { categoryId: categories[2].id }, // Capacitación
        ],
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // Policía
          { tagId: tags[3].id }, // Comunidad
        ],
      },
    },
  })
  console.log('✅ Sample news created:', news1.title)

  // Create settings
  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', value: 'NotiPoli', description: 'Nombre del sitio' },
  })
  await prisma.setting.upsert({
    where: { key: 'site_description' },
    update: {},
    create: { key: 'site_description', value: 'Plataforma de noticias para la comunidad policial', description: 'Descripción del sitio' },
  })
  await prisma.setting.upsert({
    where: { key: 'posts_per_page' },
    update: {},
    create: { key: 'posts_per_page', value: '10', description: 'Noticias por página' },
  })
  console.log('✅ Settings created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })