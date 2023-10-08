import { Controller, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { getCurrentUser } from '../common/decorators/getCurrentUser.decorator';
import { JwtPayload } from '../auth/types';

@Controller('quote/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @getCurrentUser() currentUser: JwtPayload) {
    return this.commentService.create(createCommentDto, currentUser.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
