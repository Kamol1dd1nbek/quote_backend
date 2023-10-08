import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  // Write comment
  async create(createCommentDto: CreateCommentDto, userId: number) {
    try {
      const newComment = await this.prismaService.comment.create({
        data: {
          ...createCommentDto,
          user_id: userId,
        },
      });
      return newComment;
    } catch (error) {
      throw new HttpException('Quote not found', HttpStatus.NOT_FOUND);
    }
  }

  // Update comment
  async update(commentId: number, updateCommentDto: UpdateCommentDto) {
    try {
      await this.prismaService.comment.update({
        data: {
          ...updateCommentDto,
        },
        where: {
          id: commentId,
        },
      });
    } catch (error) {
      throw new HttpException('User or quote not found', HttpStatus.NOT_FOUND);
    }
    throw new HttpException('Successfully updated', HttpStatus.OK);
  }

  // Delete comment
  async remove(id: number) {
    try {
      await this.prismaService.comment.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new HttpException('Comment not found', HttpStatus.OK);
    }
    throw new HttpException('Successfully deleted', HttpStatus.OK);
  }
}
