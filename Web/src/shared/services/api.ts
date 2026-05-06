import type { Team, Stadium, Season, Player, Coach } from "@/shared/types";

const API_BASE_URL = "http://localhost:8081";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>("/teams");
  }

  async getTeam(id: number): Promise<Team> {
    return this.request<Team>(`/teams/${id}`);
  }

  async createTeam(team: Omit<Team, "id">): Promise<Team> {
    return this.request<Team>("/teams", {
      method: "POST",
      body: JSON.stringify(team),
    });
  }

  async updateTeam(id: number, team: Partial<Team>): Promise<void> {
    return this.request<void>(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(team),
    });
  }

  async deleteTeam(id: number): Promise<void> {
    return this.request<void>(`/teams/${id}`, {
      method: "DELETE",
    });
  }

  // Stadiums
  async getStadiums(): Promise<Stadium[]> {
    return this.request<Stadium[]>("/stadiums");
  }

  async getStadium(id: number): Promise<Stadium> {
    return this.request<Stadium>(`/stadiums/${id}`);
  }

  async createStadium(stadium: Omit<Stadium, "id">): Promise<Stadium> {
    return this.request<Stadium>("/stadiums", {
      method: "POST",
      body: JSON.stringify(stadium),
    });
  }

  async updateStadium(id: number, stadium: Partial<Stadium>): Promise<void> {
    return this.request<void>(`/stadiums/${id}`, {
      method: "PUT",
      body: JSON.stringify(stadium),
    });
  }

  async deleteStadium(id: number): Promise<void> {
    return this.request<void>(`/stadiums/${id}`, {
      method: "DELETE",
    });
  }

  // Seasons
  async getSeasons(): Promise<Season[]> {
    return this.request<Season[]>("/seasons");
  }

  async getSeason(id: number): Promise<Season> {
    return this.request<Season>(`/seasons/${id}`);
  }

  async createSeason(season: Omit<Season, "id">): Promise<Season> {
    return this.request<Season>("/seasons", {
      method: "POST",
      body: JSON.stringify(season),
    });
  }

  async updateSeason(id: number, season: Partial<Season>): Promise<void> {
    return this.request<void>(`/seasons/${id}`, {
      method: "PUT",
      body: JSON.stringify(season),
    });
  }

  async deleteSeason(id: number): Promise<void> {
    return this.request<void>(`/seasons/${id}`, {
      method: "DELETE",
    });
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    return this.request<Player[]>("/players");
  }

  async getPlayer(id: number): Promise<Player> {
    return this.request<Player>(`/players/${id}`);
  }

  async createPlayer(player: Omit<Player, "id">): Promise<Player> {
    return this.request<Player>("/players", {
      method: "POST",
      body: JSON.stringify(player),
    });
  }

  async updatePlayer(id: number, player: Partial<Player>): Promise<void> {
    return this.request<void>(`/players/${id}`, {
      method: "PUT",
      body: JSON.stringify(player),
    });
  }

  async deletePlayer(id: number): Promise<void> {
    return this.request<void>(`/players/${id}`, {
      method: "DELETE",
    });
  }

  // Coaches
  async getCoaches(): Promise<Coach[]> {
    return this.request<Coach[]>("/coaches");
  }

  async getCoach(id: number): Promise<Coach> {
    return this.request<Coach>(`/coaches/${id}`);
  }

  async createCoach(coach: Omit<Coach, "id">): Promise<Coach> {
    return this.request<Coach>("/coaches", {
      method: "POST",
      body: JSON.stringify(coach),
    });
  }

  async updateCoach(id: number, coach: Partial<Coach>): Promise<void> {
    return this.request<void>(`/coaches/${id}`, {
      method: "PUT",
      body: JSON.stringify(coach),
    });
  }

  async deleteCoach(id: number): Promise<void> {
    return this.request<void>(`/coaches/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();
