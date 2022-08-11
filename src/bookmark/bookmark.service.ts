import { ForbiddenException, Injectable } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { use } from 'passport';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }
    getBookmarks(userId: number) {
        const bookmarks = this.prisma.bookmark.findMany({
            where: {
                userId: userId
            }
        })
        return bookmarks;
    }

    async CreateBookmark(userId: number, dto: CreateBookMarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId: userId,
                ...dto
            }
        });
        return bookmark;
    }

    GetBookmarkById(userId: number, bookmarkId: number): Promise<Bookmark> {
        const bookmark = this.prisma.bookmark.findFirst({
            where: {
                userId: userId,
                id: bookmarkId
            },
        })
        return bookmark;
    }

    async EditBookmarkById(userId: number, bookmarkId: number, dto: EditBookMarkDto) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            },
        });

        if (!bookmark || bookmark.userId != userId) {
            throw new ForbiddenException('Access to resource denied')
        }

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId
            },
            data: {
                ...dto
            }
        });
    }

    async DeleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            },
        });

        if (!bookmark || bookmark.userId != userId) {
            throw new ForbiddenException('Access to resource denied')
        }

        return this.prisma.bookmark.delete({
            where: {
                id: bookmarkId,
            },
        });
    }
}
