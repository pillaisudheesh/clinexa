import { Department } from '@prisma/client';

import { DepartmentResponseDto } from './dto/department-response.dto';
import { DepartmentReferenceDto } from '../common/reference/department-reference.dto';

export class DepartmentMapper {
  static toResponseDto(department: Department): DepartmentResponseDto {
    return {
      id: department.id,

      code: department.code,

      name: department.name,

      description: department.description,

      displayOrder: department.displayOrder,

      isSystem: department.isSystem,

      isActive: department.isActive,

      createdAt: department.createdAt,

      updatedAt: department.updatedAt,
    };
  }

  static toResponseDtos(departments: Department[]): DepartmentResponseDto[] {
    return departments.map((department) => this.toResponseDto(department));
  }

  static toReferenceDto(department: Department): DepartmentReferenceDto {
    return {
      id: department.id,
      code: department.code,
      name: department.name,
    };
  }
}
