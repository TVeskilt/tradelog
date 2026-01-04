import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DataResponseDto<T> {
  @ApiProperty({
    description: 'Response data payload',
  })
  @Expose()
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}
