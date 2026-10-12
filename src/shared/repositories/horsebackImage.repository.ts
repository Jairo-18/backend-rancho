import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { HorsebackImage } from '../entities/horsebackImage.entity.js';

@Injectable()
export class HorsebackImageRepository extends Repository<HorsebackImage> {
  constructor(dataSource: DataSource) {
    super(HorsebackImage, dataSource.createEntityManager());
  }
}
