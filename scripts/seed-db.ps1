$base = "http://localhost:8080"

function Wait-ServerReady {
    param($url, $retries = 20)
    for ($i = 0; $i -lt $retries; $i++) {
        try {
            Invoke-RestMethod -Method Get -Uri "$url/teams" -ErrorAction Stop | Out-Null
            Write-Host "Server is ready."
            return $true
        } catch {
            Write-Host "Waiting for server... attempt $($i+1)"
            Start-Sleep -Seconds 1
        }
    }
    Write-Error "Server did not become ready in time"
    return $false
}

if (-not (Wait-ServerReady -url $base)) { exit 1 }

# Helper to POST JSON and return parsed object
function PostJson($url, $body) {
    return Invoke-RestMethod -Method Post -Uri $url -Body ($body | ConvertTo-Json -Depth 5) -ContentType "application/json"
}

# Create multiple teams
$teamsData = @(
    @{name="Red Lions"; province="North"; mascot="Lion"; color="#ff0000"; championships_played=5; championships_won=2},
    @{name="Blue Hawks"; province="South"; mascot="Hawk"; color="#0000ff"; championships_played=3; championships_won=1},
    @{name="Green Eagles"; province="East"; mascot="Eagle"; color="#00aa00"; championships_played=2; championships_won=0},
    @{name="Yellow Tigers"; province="West"; mascot="Tiger"; color="#ffcc00"; championships_played=1; championships_won=0},
    @{name="Black Bears"; province="Central"; mascot="Bear"; color="#000000"; championships_played=4; championships_won=1},
    @{name="White Wolves"; province="High"; mascot="Wolf"; color="#ffffff"; championships_played=0; championships_won=0}
)

# Fetch existing teams once to avoid duplicates
$existingTeams = Invoke-RestMethod -Method Get -Uri "$base/teams" -ErrorAction SilentlyContinue
$createdTeams = @()
foreach ($t in $teamsData) {
    $found = $null
    if ($existingTeams) { $found = $existingTeams | Where-Object { $_.name -eq $t.name } }
    if ($found) {
        $createdTeams += $found
    } else {
        try {
            $res = PostJson "$base/teams" $t
            $createdTeams += $res
        } catch {
            # If duplicate error happened concurrently, fall back to fetching list and using existing
            $existingTeams = Invoke-RestMethod -Method Get -Uri "$base/teams" -ErrorAction SilentlyContinue
            $found2 = $existingTeams | Where-Object { $_.name -eq $t.name }
            if ($found2) { $createdTeams += $found2 }
            else { Write-Error "Failed to create or find team $($t.name): $_" }
        }
    }
}
Write-Host "Created/Found teams:" ($createdTeams | ForEach-Object { $_.id } )

# Create stadiums
$stadiumsData = @(
    @{name="Central Stadium"; capacity=25000},
    @{name="East Arena"; capacity=18000}
)
 # Fetch existing stadiums first
 $existingStadiums = Invoke-RestMethod -Method Get -Uri "$base/stadiums" -ErrorAction SilentlyContinue
 $createdStadiums = @()
 foreach ($s in $stadiumsData) {
    $found = $null
    if ($existingStadiums) { $found = $existingStadiums | Where-Object { $_.name -eq $s.name } }
    if ($found) {
        $createdStadiums += $found
    } else {
        try {
            $createdStadiums += PostJson "$base/stadiums" $s
        } catch {
            $existingStadiums = Invoke-RestMethod -Method Get -Uri "$base/stadiums" -ErrorAction SilentlyContinue
            $found2 = $existingStadiums | Where-Object { $_.name -eq $s.name }
            if ($found2) { $createdStadiums += $found2 } else { Write-Error "Failed to create or find stadium $($s.name): $_" }
        }
    }
 }
 Write-Host "Created/Found stadiums:" ($createdStadiums | ForEach-Object { $_.id })

# Create a season
$season = PostJson "$base/seasons" @{start_date="2026-01-01"; end_date="2026-12-31"}
Write-Host "Created season:" $season.id

# Create 2 players per team (simple roster)
$players = @()
$num = 1
foreach ($team in $createdTeams) {
    $p1 = PostJson "$base/players" @{team_id=$team.id; name="Player_${($team.name)}_A"; number=$num; years_in_team=(Get-Random -Minimum 1 -Maximum 5); position="Forward"; matches_played=0; average_goals_per_match=0}
    $num++
    $p2 = PostJson "$base/players" @{team_id=$team.id; name="Player_${($team.name)}_B"; number=$num; years_in_team=(Get-Random -Minimum 1 -Maximum 5); position="Midfielder"; matches_played=0; average_goals_per_match=0}
    $num++
    $players += $p1; $players += $p2
}
Write-Host "Created players:" ($players | ForEach-Object { $_.id })

# Create coaches for first 4 teams
$coaches = @()
foreach ($team in $createdTeams[0..3]) {
    $c = PostJson "$base/coaches" @{team_id=$team.id; name="Coach_${($team.name)}"; number=(Get-Random -Minimum 1 -Maximum 10); years_in_team=(Get-Random -Minimum 1 -Maximum 10); experience_years=(Get-Random -Minimum 1 -Maximum 20); championships_won=(Get-Random -Minimum 0 -Maximum 3)}
    $coaches += $c
}
Write-Host "Created coaches:" ($coaches | ForEach-Object { $_.id })

# Create multiple matches across dates between various teams
$matches = @()
$dates = @("2026-04-15","2026-04-22","2026-05-01","2026-05-08","2026-05-15")
for ($i=0; $i -lt $dates.Count; $i++) {
    $homeId = $createdTeams[($i % $createdTeams.Count)].id
    $awayId = $createdTeams[((($i+1) % $createdTeams.Count))].id
    $stadiumId = $createdStadiums[($i % $createdStadiums.Count)].id
    try {
        $match = PostJson "$base/matches" @{home_team_id=$homeId; away_team_id=$awayId; season_id=$season.id; stadium_id=$stadiumId; match_date=$dates[$i]; home_goals=(Get-Random -Minimum 0 -Maximum 4); away_goals=(Get-Random -Minimum 0 -Maximum 4); attendance=(Get-Random -Minimum 5000 -Maximum 20000)}
        $matches += $match
    } catch {
        Write-Error "Failed to create match on $($dates[$i]): $_"
    }
}
Write-Host "Created matches:" ($matches | ForEach-Object { $_.id })

# Create player stats for a subset of matches (first two matches)
$stats = @()
foreach ($m in $matches[0..1]) {
    # pick two players from home and away teams
    $homePlayers = $players | Where-Object { $_.team_id -eq $m.home_team_id }
    $awayPlayers = $players | Where-Object { $_.team_id -eq $m.away_team_id }
    if ($homePlayers.Count -lt 1 -or $awayPlayers.Count -lt 1) { continue }
    $hp = $homePlayers[0]
    $ap = $awayPlayers[0]
    $s1 = PostJson "$base/player-stats" @{player_id=$hp.id; match_id=$m.id; goals_scored=(Get-Random -Minimum 0 -Maximum 3); assists=(Get-Random -Minimum 0 -Maximum 2); shots_on_goal=(Get-Random -Minimum 0 -Maximum 5); passes_completed=(Get-Random -Minimum 10 -Maximum 60); interceptions=(Get-Random -Minimum 0 -Maximum 3); tackles=(Get-Random -Minimum 0 -Maximum 5); blocks=0; saves=0; goals_conceded=0}
    $s2 = PostJson "$base/player-stats" @{player_id=$ap.id; match_id=$m.id; goals_scored=(Get-Random -Minimum 0 -Maximum 3); assists=(Get-Random -Minimum 0 -Maximum 2); shots_on_goal=(Get-Random -Minimum 0 -Maximum 5); passes_completed=(Get-Random -Minimum 10 -Maximum 60); interceptions=(Get-Random -Minimum 0 -Maximum 3); tackles=(Get-Random -Minimum 0 -Maximum 5); blocks=0; saves=0; goals_conceded=0}
    $stats += $s1; $stats += $s2
}
Write-Host "Created player stats:" ($stats | ForEach-Object { $_.id })

# Print summary JSON with IDs so caller can reuse
$summary = @{
    teams = $createdTeams | ForEach-Object { @{ id = $_.id; name = $_.name } }
    stadiums = $createdStadiums | ForEach-Object { @{ id = $_.id; name = $_.name } }
    season = @{ id = $season.id; start_date = $season.start_date; end_date = $season.end_date }
    players = $players | ForEach-Object { @{ id = $_.id; team_id = $_.team_id; name = $_.name } }
    coaches = $coaches | ForEach-Object { @{ id = $_.id; team_id = $_.team_id; name = $_.name } }
    matches = $matches | ForEach-Object { @{ id = $_.id; date = $_.match_date; home = $_.home_team_id; away = $_.away_team_id } }
    player_stats = $stats | ForEach-Object { @{ id = $_.id; player_id = $_.player_id; match_id = $_.match_id } }
}

Write-Host "\n--- Seed Summary ---"
$summary | ConvertTo-Json -Depth 5 | Write-Host

Write-Host "\nSeed script finished."
