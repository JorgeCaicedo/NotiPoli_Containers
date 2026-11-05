// notipoli-node/src/services/favoriteService.ts
import prisma from '../config/prisma.js'

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      news: {
        include: {
          author: { select: { name: true } },
          categories: true,
          tags: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function isFavorite(userId: string, newsId: string) {
  return prisma.favorite.findUnique({
    where: {
      userId_newsId: {
        userId,
        newsId,
      },
    },
  })
}

export async function addFavorite(userId: string, newsId: string) {
  return prisma.favorite.create({
    data: { userId, newsId },
    include: {
      news: {
        include: {
          author: { select: { name: true } },
          categories: true,
          tags: true,
        },
      },
    },
  })
}

export async function removeFavorite(userId: string, newsId: string) {
  return prisma.favorite.delete({
    where: {
      userId_newsId: {
        userId,
        newsId,
      },
    },
  })
}