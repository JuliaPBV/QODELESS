import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindAllParameters, TaskDto, TaskStatusEnum } from './task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from 'src/db/entities/task.entity';
import { Repository, FindOptionsWhere, Like } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  async create(task: TaskDto): Promise<TaskDto> {
    const taskToSave: TaskEntity = {
      title: task.title,
      description: task.description,
      expirationDate: task.expirationDate,
      status: TaskStatusEnum.TO_DO,
    };

    const createdTask = await this.taskRepository.save(taskToSave);

    return this.mapEntityToDto(createdTask);
  }

  async findById(id: string): Promise<TaskDto> {
    const foundTask = await this.taskRepository.findOne({ where: { id } });

    if (!foundTask) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapEntityToDto(foundTask);
  }

  async findAll(params: FindAllParameters): Promise<TaskDto[]> {
    const searchParams: FindOptionsWhere<TaskEntity> = {};

    if (params.title) {
      searchParams.title = Like(`%${params.title}%`);
    }

    if (params.status) {
      searchParams.status = Like(`%${params.status}%`);
    }

    const tasksFound = await this.taskRepository.find({
      where: searchParams,
    });

    return tasksFound.map((TaskEntity) => this.mapEntityToDto(TaskEntity));
  }

  async update(id: string, task: TaskDto) {
    const foundTask = await this.taskRepository.findOne({ where: { id } });

    if (!foundTask) {
      throw new HttpException(
        `Task with id ${task.id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.taskRepository.update(id, this.mapDtoToEntity(task));
  }

  async remove(id: string) {
    const result = await this.taskRepository.delete(id);

    if (!result.affected) {
      throw new HttpException(
        `Task with id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private mapEntityToDto(TaskEntity: TaskEntity): TaskDto {
    return {
      id: TaskEntity.id,
      title: TaskEntity.title,
      description: TaskEntity.description,
      expirationDate: TaskEntity.expirationDate,
      status: TaskStatusEnum[TaskEntity.status],
    };
  }

  private mapDtoToEntity(TaskDto: TaskDto): Partial<TaskEntity> {
    return {
      title: TaskDto.title,
      description: TaskDto.description,
      expirationDate: TaskDto.expirationDate,
      status: TaskDto.status.toString(),
    };
  }
}
