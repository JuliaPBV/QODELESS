import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskDto } from './task.dto';
import { FindAllParameters } from './task.dto';
import { TaskService } from './task.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { TaskRouteParameters } from './task.dto';

@UseGuards(AuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskservice: TaskService) {}

  @Post()
  async create(@Body() task: TaskDto): Promise<TaskDto> {
    return await this.taskservice.create(task);
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<TaskDto> {
    return this.taskservice.findById(id);
  }

  @Get()
  async findAll(@Query() params: FindAllParameters): Promise<TaskDto[]> {
    return this.taskservice.findAll(params);
  }

  @Put('/:id')
  async update(@Param() params: TaskRouteParameters, @Body() task: TaskDto) {
    await this.taskservice.update(params.id, task);
  }

  @Delete('/:id')
  remove(@Param() id: string) {
    return this.taskservice.remove(id);
  }
}
