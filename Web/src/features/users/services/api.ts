import type {
  User,
  CreateUserRequest,
  UpdateUserRoleRequest,
} from "../types";
import type { PaginatedResponse } from "@/shared/types";
import { apiRequest } from "@/shared/utils/api-client";
import { API_ROUTES } from "@/shared/config/routes";
import type { ListApiParams } from "@/shared/components/data-table";

class UsersApiService {
  async getUsersPage(params: ListApiParams): Promise<PaginatedResponse<User>> {
    return apiRequest<PaginatedResponse<User>>(API_ROUTES.users.collection(params));
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    return apiRequest<User>(API_ROUTES.users.collection(), {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUserRole(id: number, data: UpdateUserRoleRequest): Promise<User> {
    return apiRequest<User>(API_ROUTES.users.detail(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return apiRequest<void>(API_ROUTES.users.detail(id), {
      method: "DELETE",
    });
  }
}

export const usersApiService = new UsersApiService();
