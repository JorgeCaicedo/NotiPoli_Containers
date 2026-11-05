// notipoli-node/src/services/roleMenuService.ts
import prisma from '../config/prisma.js'

export interface RoleMenu {
  id: number
  role: string
  menuPath: string
  menuLabel: string
  menuIcon: string | null
  menuOrder: number
}

export async function getRoleMenus(role: string): Promise<RoleMenu[]> {
  const menus = await prisma.roleMenu.findMany({
    where: { role },
    orderBy: { menuOrder: 'asc' },
  })
  return menus as RoleMenu[]
}

export async function getAllRoleMenus(): Promise<RoleMenu[]> {
  const menus = await prisma.roleMenu.findMany({
    orderBy: [{ role: 'asc' }, { menuOrder: 'asc' }],
  })
  return menus as RoleMenu[]
}