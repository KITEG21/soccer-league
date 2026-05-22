export interface Season {
  id: number;
  start_date?: string;
  end_date?: string;
}

export interface CreateSeasonRequest {
  start_date?: string;
  end_date?: string;
}

export interface UpdateSeasonRequest {
  start_date?: string;
  end_date?: string;
}
