export interface Stadium {
  id: number;
  name: string;
  capacity: number;
}

export interface CreateStadiumRequest {
  name: string;
  capacity?: number;
}

export interface UpdateStadiumRequest {
  name: string;
  capacity?: number;
}
