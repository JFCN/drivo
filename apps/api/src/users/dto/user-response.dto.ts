import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';

type UserEntity = User & {
  avatar?: { updatedAt: Date } | null;
};

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Mariana' })
  firstName: string;

  @ApiProperty({ example: 'Costa' })
  lastName: string;

  @ApiProperty({ example: 'mariana.costa@email.com' })
  email: string;

  @ApiPropertyOptional({
    nullable: true,
    type: String,
    example: '/api/users/me/avatar?v=1760000000000',
    description: 'Foto de perfil. Null quando o usuário não enviou foto',
  })
  avatarUrl: string | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(user: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.avatarUrl = user.avatar ? `/api/users/me/avatar?v=${user.avatar.updatedAt.getTime()}` : null;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
