import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}
    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId)
    }

    @Post()
    CreateBookmark(
        @GetUser('id') userId: number,
        @Body() dto: CreateBookMarkDto, 
    ){
        return this.bookmarkService.CreateBookmark(userId, dto)
    }

    @Get(':id')
    GetBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,    
    ){
        return this.bookmarkService.GetBookmarkById(userId, bookmarkId)
    }

    @Patch(':id')
    EditBookmarkById(
        @GetUser('id') userId: number,
        @Body() dto: EditBookMarkDto,
        @Param('id', ParseIntPipe) bookmarkId: number,
    ){
        return this.bookmarkService.EditBookmarkById(userId, bookmarkId, dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    DeleteBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) bookmarkId: number,    
    ){
        return this.bookmarkService.DeleteBookmarkById(userId, bookmarkId)
    }

}
