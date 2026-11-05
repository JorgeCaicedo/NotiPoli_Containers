// notipoli-node/prisma/seed.ts
import { PrismaClient, UserRole, NewsStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create password hash
  const passwordHash = await bcrypt.hash('admin123', 12)
  const editorPasswordHash = await bcrypt.hash('editor123', 12)
  const viewerPasswordHash = await bcrypt.hash('viewer123', 12)

  // Create admin user
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
      passwordHash: editorPasswordHash,
      name: 'Editor Notas',
      role: UserRole.EDITOR,
      isActive: true,
    },
  })
  console.log('✅ Editor user created:', editor.email)

  // Create viewer/registrado user
  const viewer = await prisma.user.upsert({
    where: { email: 'registrado@notipoli.com' },
    update: {},
    create: {
      email: 'registrado@notipoli.com',
      passwordHash: viewerPasswordHash,
      name: 'Usuario Registrado',
      role: UserRole.VIEWER,
      isActive: true,
    },
  })
  console.log('✅ Viewer user created:', viewer.email)

  // Create categories - exact categories requested: Educación, Tecnología, Campus, Deportes

  // Create additional categories for news and favoritos
  const educacion = await prisma.category.upsert({
    where: { slug: 'educacion' },
    update: {},
    create: { name: 'Educación', slug: 'educacion', description: 'Noticias educativas y académicas', color: '#3B82F6' },
  })

  const tecnologia = await prisma.category.upsert({
    where: { slug: 'tecnologia' },
    update: {},
    create: { name: 'Tecnología', slug: 'tecnologia', description: 'Avances tecnológicos en seguridad', color: '#2563EB' },
  })

  const campus = await prisma.category.upsert({
    where: { slug: 'campus' },
    update: {},
    create: { name: 'Campus', slug: 'campus', description: 'Noticias del campus universitario', color: '#8B5CF6' },
  })

  const deportes = await prisma.category.upsert({
    where: { slug: 'deportes' },
    update: {},
    create: { name: 'Deportes', slug: 'deportes', description: 'Noticias deportivas policiales', color: '#F59E0B' },
  })

  console.log('✅ Categories created:', [educacion.name, tecnologia.name, campus.name, deportes.name])

  // Create additional categories for news
  const seguridad = await prisma.category.upsert({
    where: { slug: 'seguridad' },
    update: {},
    create: { name: 'Seguridad', slug: 'seguridad', description: 'Noticias de seguridad pública', color: '#DC2626' },
  })

  const normativa = await prisma.category.upsert({
    where: { slug: 'normativa' },
    update: {},
    create: { name: 'Normativa', slug: 'normativa', description: 'Leyes y reglamentos', color: '#9333EA' },
  })

  console.log('✅ Additional categories created:', [seguridad.name, normativa.name])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'policia' }, update: {}, create: { name: 'Policía', slug: 'policia' } }),
    prisma.tag.upsert({ where: { slug: 'prevencion' }, update: {}, create: { name: 'Prevención', slug: 'prevencion' } }),
    prisma.tag.upsert({ where: { slug: 'operativo' }, update: {}, create: { name: 'Operativo', slug: 'operativo' } }),
    prisma.tag.upsert({ where: { slug: 'comunidad' }, update: {}, create: { name: 'Comunidad', slug: 'comunidad' } }),
    prisma.tag.upsert({ where: { slug: 'tecnologia' }, update: {}, create: { name: 'Tecnología', slug: 'tecnologia' } }),
  ])
  console.log('✅ Tags created:', tags.length)

  // Create sample news with Tecnología and Educación categories
  const news1 = await prisma.news.create({
    data: {
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
          { categoryId: seguridad.id },
          { categoryId: normativa.id },
        ],
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // Policía
          { tagId: tags[4].id }, // Tecnología
        ],
      },
    },
  })
  console.log('✅ Sample news created:', news1.title)

  // Create second news with Tecnología and Educación categories
  const news2 = await prisma.news.create({
    data: {
      title: 'Innovaciones tecnológicas en la seguridad policial',
      slug: 'innovaciones-tecnologicas-seguridad-policial',
      excerpt: 'Las nuevas herramientas tecnológicas están transformando la labor policial.',
      content: `
        <h2>Innovaciones tecnológicas</h2>
        <p>La inteligencia artificial y los sistemas de videoanálisis están revolucionando la seguridad pública.</p>
        <h3>Aplicaciones actuales</h3>
        <ul>
          <li>Detectores de objetos sospechosos</li>
          <li>Sistemas de reconocimiento facial (con consentimiento)</li>
          <li>Drone surveillance en eventos</li>
        </ul>
        <p>Estas herramientas permiten una detección más eficiente de amenazas y una respuesta más rápida.</p>
      `,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: editor.id,
      categories: {
        create: [
          { categoryId: tecnologia.id },
          { categoryId: educacion.id },
        ],
      },
      tags: {
        create: [
          { tagId: tags[4].id }, // Tecnología
          { tagId: tags[1].id }, // Prevención
        ],
      },
    },
  })
  console.log('✅ Sample news created:', news2.title)

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

  // Create role menus for all roles
  const menus = [
    // ADMIN menus: Inicio, Noticias, Favoritos, Contacto, Gestión Noticias, Administración
    { role: 'ADMIN', menuPath: '/', menuLabel: 'Inicio', menuIcon: 'bi bi-house', menuOrder: 1 },
    { role: 'ADMIN', menuPath: '/noticias', menuLabel: 'Noticias', menuIcon: 'bi bi-newspaper', menuOrder: 2 },
    { role: 'ADMIN', menuPath: '/favoritos', menuLabel: 'Favoritos', menuIcon: 'bi bi-star', menuOrder: 3 },
    { role: 'ADMIN', menuPath: '/contacto', menuLabel: 'Contacto', menuIcon: 'bi bi-envelope', menuOrder: 4 },
    { role: 'ADMIN', menuPath: '/herramientas-noticias', menuLabel: 'Gestión Noticias', menuIcon: 'bi bi-file-earmark-text', menuOrder: 5 },
    { role: 'ADMIN', menuPath: '/administracion', menuLabel: 'Administración', menuIcon: 'bi bi-shield-lock', menuOrder: 6 },

    // EDITOR menus
    { role: 'EDITOR', menuPath: '/', menuLabel: 'Inicio', menuIcon: 'bi bi-house', menuOrder: 1 },
    { role: 'EDITOR', menuPath: '/noticias', menuLabel: 'Noticias', menuIcon: 'bi bi-newspaper', menuOrder: 2 },
    { role: 'EDITOR', menuPath: '/favoritos', menuLabel: 'Favoritos', menuIcon: 'bi bi-star', menuOrder: 3 },
    { role: 'EDITOR', menuPath: '/contacto', menuLabel: 'Contacto', menuIcon: 'bi bi-envelope', menuOrder: 4 },
    { role: 'EDITOR', menuPath: '/herramientas-noticias', menuLabel: 'Gestión Noticias', menuIcon: 'bi bi-file-earmark-text', menuOrder: 5 },

    // VIEWER menus
    { role: 'VIEWER', menuPath: '/', menuLabel: 'Inicio', menuIcon: 'bi bi-house', menuOrder: 1 },
    { role: 'VIEWER', menuPath: '/noticias', menuLabel: 'Noticias', menuIcon: 'bi bi-newspaper', menuOrder: 2 },
    { role: 'VIEWER', menuPath: '/favoritos', menuLabel: 'Favoritos', menuIcon: 'bi bi-star', menuOrder: 3 },
    { role: 'VIEWER', menuPath: '/contacto', menuLabel: 'Contacto', menuIcon: 'bi bi-envelope', menuOrder: 4 },
  ]

  for (const menu of menus) {
    await prisma.roleMenu.upsert({
      where: { role_menuPath: { role: menu.role, menuPath: menu.menuPath } },
      update: { menuLabel: menu.menuLabel, menuIcon: menu.menuIcon, menuOrder: menu.menuOrder },
      create: menu,
    })
  }
  console.log('✅ Role menus created:', menus.length)

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