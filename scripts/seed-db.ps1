param(
    [string]$BaseUrl = "http://localhost:8080"
)

$base = $BaseUrl

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

function PostJson($url, $body) {
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 5))
    return Invoke-RestMethod -Method Post -Uri $url -Body $jsonBytes -ContentType "application/json; charset=utf-8"
}

function PutJson($url, $body) {
    $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 5))
    return Invoke-RestMethod -Method Put -Uri $url -Body $jsonBytes -ContentType "application/json; charset=utf-8"
}

function Get-StatsForPosition($position) {
    switch ($position) {
        "Portero" {
            return @{
                goals_scored = 0; assists = 0; shots_on_goal = 0
                passes_completed = (Get-Random -Minimum 5 -Maximum 25); interceptions = 0
                tackles = 0; blocks = 0
                saves = (Get-Random -Minimum 2 -Maximum 11); goals_conceded = (Get-Random -Minimum 0 -Maximum 4)
            }
        }
        "Defensa" {
            $defGoal = 0
            if ((Get-Random -Minimum 0 -Maximum 10) -lt 1) { $defGoal = 1 }
            return @{
                goals_scored = $defGoal
                assists = (Get-Random -Minimum 0 -Maximum 2)
                shots_on_goal = (Get-Random -Minimum 0 -Maximum 2)
                passes_completed = (Get-Random -Minimum 10 -Maximum 41)
                interceptions = (Get-Random -Minimum 1 -Maximum 6)
                tackles = (Get-Random -Minimum 2 -Maximum 9)
                blocks = (Get-Random -Minimum 1 -Maximum 7)
                saves = 0; goals_conceded = 0
            }
        }
        "Mediocampo" {
            return @{
                goals_scored = (Get-Random -Minimum 0 -Maximum 3)
                assists = (Get-Random -Minimum 0 -Maximum 4)
                shots_on_goal = (Get-Random -Minimum 0 -Maximum 4)
                passes_completed = (Get-Random -Minimum 20 -Maximum 71)
                interceptions = (Get-Random -Minimum 2 -Maximum 9)
                tackles = (Get-Random -Minimum 0 -Maximum 4)
                blocks = (Get-Random -Minimum 0 -Maximum 3)
                saves = 0; goals_conceded = 0
            }
        }
        "Delantero" {
            return @{
                goals_scored = (Get-Random -Minimum 0 -Maximum 4)
                assists = (Get-Random -Minimum 0 -Maximum 3)
                shots_on_goal = (Get-Random -Minimum 2 -Maximum 9)
                passes_completed = (Get-Random -Minimum 5 -Maximum 21)
                interceptions = (Get-Random -Minimum 0 -Maximum 3)
                tackles = 0; blocks = 0
                saves = 0; goals_conceded = 0
            }
        }
    }
}

if (-not (Wait-ServerReady -url $base)) { exit 1 }

# ---------- Teams ----------
$teamsData = @(
    @{name="Halcones de La Habana"; province="La Habana"; mascot="Halcón"; color="#E65100"; championships_played=15; championships_won=5},
    @{name="Caimanes de Matanzas"; province="Matanzas"; mascot="Caimán"; color="#2E7D32"; championships_played=12; championships_won=3},
    @{name="Tabaqueros de Pinar del Río"; province="Pinar del Río"; mascot="Tabaquero"; color="#6D4C41"; championships_played=10; championships_won=2},
    @{name="Centinelas de Sancti Spíritus"; province="Sancti Spíritus"; mascot="Centinela"; color="#F9A825"; championships_played=8; championships_won=1},
    @{name="Delfines de Cienfuegos"; province="Cienfuegos"; mascot="Delfín"; color="#0277BD"; championships_played=9; championships_won=2},
    @{name="Toros de Granma"; province="Granma"; mascot="Toro"; color="#8D6E63"; championships_played=14; championships_won=4},
    @{name="Soles de Santiago"; province="Santiago de Cuba"; mascot="Sol"; color="#C62828"; championships_played=11; championships_won=3},
    @{name="Mineros de Holguín"; province="Holguín"; mascot="Minero"; color="#4527A0"; championships_played=7; championships_won=0}
)

$existingTeams = Invoke-RestMethod -Method Get -Uri "$base/teams?limit=200" -ErrorAction SilentlyContinue
$createdTeams = @()
foreach ($t in $teamsData) {
    $found = $null
    if ($existingTeams) { $found = $existingTeams | Where-Object { $_.name -eq $t.name } }
    if ($found) {
        $createdTeams += $found
    } else {
        try {
            $createdTeams += PostJson "$base/teams" $t
        } catch {
            Write-Error "Failed to create team $($t.name): $_"
        }
    }
}
Write-Host "Created/Found teams:" ($createdTeams | ForEach-Object { "$($_.id):$($_.name)" })

# ---------- Stadiums ----------
$stadiumsData = @(
    @{name="Estadio Nacional de La Habana"; capacity=45000},
    @{name="Estadio Olímpico de Matanzas"; capacity=22000},
    @{name="Estadio Provincial de Pinar del Río"; capacity=18000},
    @{name="Estadio Municipal de Santiago"; capacity=20000},
    @{name="Estadio Central de Holguín"; capacity=15000}
)

$existingStadiums = Invoke-RestMethod -Method Get -Uri "$base/stadiums?limit=200" -ErrorAction SilentlyContinue
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
            Write-Error "Failed to create stadium $($s.name): $_"
        }
    }
}
Write-Host "Created/Found stadiums:" ($createdStadiums | ForEach-Object { "$($_.id):$($_.name)" })

# ---------- Seasons ----------
$existingSeasons = Invoke-RestMethod -Method Get -Uri "$base/seasons?limit=200" -ErrorAction SilentlyContinue

$seasonPastDates = @{start_date="2025-01-05"; end_date="2025-11-30"}
$seasonCurrentDates = @{start_date="2026-01-10"; end_date="2026-12-20"}

$seasonPast = $null
$seasonCurrent = $null
if ($existingSeasons) {
    $seasonPast = $existingSeasons | Where-Object { $_.start_date -eq $seasonPastDates.start_date }
    $seasonCurrent = $existingSeasons | Where-Object { $_.start_date -eq $seasonCurrentDates.start_date }
}
if (-not $seasonPast) { $seasonPast = PostJson "$base/seasons" $seasonPastDates }
if (-not $seasonCurrent) { $seasonCurrent = PostJson "$base/seasons" $seasonCurrentDates }

Write-Host "Past season: $($seasonPast.id) ($($seasonPast.start_date) - $($seasonPast.end_date))"
Write-Host "Current season: $($seasonCurrent.id) ($($seasonCurrent.start_date) - $($seasonCurrent.end_date))"

# ---------- Players & Coaches ----------
$firstNames = @("Carlos","Luis","Manuel","Raúl","Pedro","Jorge","Miguel","Ernesto","Alejandro","Roberto",
                 "Daniel","Eduardo","Andrés","Fernando","Ricardo","Javier","Osvaldo","Yoel","Reinier","Maikel",
                 "Yunior","Lázaro","Adrián","Leonel","Rolando","Yasser","Yoandri","Dariel","Frank","Idelfonso")
$lastNames  = @("Pérez","Hernández","Rodríguez","Gómez","Fernández","Martínez","Díaz","Torres","Castillo","Ramírez",
                 "Suárez","Morales","Reyes","Flores","Ortiz","Vargas","Soto","Núñez","Acosta","Linares",
                 "Pacheco","Domínguez","Cabrera","Aguilar","Ibáñez")

$nameCounter = 0
function Get-NextName {
    $script:nameCounter++
    $fn = $firstNames[$script:nameCounter % $firstNames.Count]
    $ln = $lastNames[($script:nameCounter * 7) % $lastNames.Count]
    return "$fn $ln"
}

$rosterTemplate = @(
    "Portero","Defensa","Defensa","Defensa","Defensa",
    "Mediocampo","Mediocampo","Mediocampo","Mediocampo",
    "Delantero","Delantero","Delantero"
)

$allPlayers = Invoke-RestMethod -Method Get -Uri "$base/players?limit=500" -ErrorAction SilentlyContinue
$allCoaches = Invoke-RestMethod -Method Get -Uri "$base/coaches?limit=500" -ErrorAction SilentlyContinue

$players = @()
$coaches = @()
foreach ($team in $createdTeams) {
    $existingTeamPlayers = @()
    if ($allPlayers) { $existingTeamPlayers = @($allPlayers | Where-Object { $_.team_id -eq $team.id }) }

    if ($existingTeamPlayers.Count -ge $rosterTemplate.Count) {
        $players += $existingTeamPlayers
    } else {
        $dorsal = 1
        foreach ($position in $rosterTemplate) {
            $p = PostJson "$base/players" @{
                team_id = $team.id
                name = Get-NextName
                number = $dorsal
                years_in_team = (Get-Random -Minimum 1 -Maximum 9)
                position = $position
            }
            $players += $p
            $dorsal++
        }
    }

    $existingTeamCoach = $null
    if ($allCoaches) { $existingTeamCoach = $allCoaches | Where-Object { $_.team_id -eq $team.id } | Select-Object -First 1 }

    if ($existingTeamCoach) {
        $coaches += $existingTeamCoach
    } else {
        $yearsInTeam = Get-Random -Minimum 2 -Maximum 9
        $experience = $yearsInTeam + (Get-Random -Minimum 0 -Maximum 13)
        $c = PostJson "$base/coaches" @{
            team_id = $team.id
            name = Get-NextName
            number = ($rosterTemplate.Count + 1)
            years_in_team = $yearsInTeam
            experience_years = $experience
            championships_won = (Get-Random -Minimum 0 -Maximum 4)
        }
        $coaches += $c
    }
}
Write-Host "Players ready: $($players.Count) | Coaches ready: $($coaches.Count)"

# ---------- Matches ----------
function New-RoundRobinPairs($teams, $count) {
    $pairs = @()
    $n = $teams.Count
    for ($i = 0; $i -lt $count; $i++) {
        $round = [math]::Floor($i / $n)
        $homeTeam = $teams[$i % $n]
        $awayTeam = $teams[($i + 1 + $round) % $n]
        if ($homeTeam.id -ne $awayTeam.id) { $pairs += @{home=$homeTeam; away=$awayTeam} }
    }
    return $pairs
}

$today = Get-Date "2026-06-19"
$existingMatches = Invoke-RestMethod -Method Get -Uri "$base/matches?limit=500" -ErrorAction SilentlyContinue

function Add-MatchWithStats($homeTeam, $awayTeam, $seasonId, $stadium, $matchDate, $disputed, $allPlayers) {
    $capacity = if ($stadium.capacity -gt 0) { $stadium.capacity } else { 10000 }
    $attendance = [int]($capacity * (Get-Random -Minimum 40 -Maximum 96) / 100)

    $match = PostJson "$base/matches" @{
        home_team_id = $homeTeam.id
        away_team_id = $awayTeam.id
        season_id = $seasonId
        stadium_id = $stadium.id
        match_date = $matchDate
        attendance = $attendance
        disputed = $disputed
    }

    if ($disputed) {
        $squad = @($allPlayers | Where-Object { $_.team_id -eq $homeTeam.id -or $_.team_id -eq $awayTeam.id })
        foreach ($player in $squad) {
            $stats = Get-StatsForPosition $player.position
            $stats["player_id"] = $player.id
            $stats["match_id"] = $match.id
            PostJson "$base/player-stats" $stats | Out-Null
        }
    }
    return $match
}

$matches = @()
$existingMatchCount = 0
if ($existingMatches) { $existingMatchCount = @($existingMatches).Count }
if ($existingMatchCount -lt 1) {
    $stadiumIdx = 0

    # Past season: fully disputed matches
    $pastPairs = New-RoundRobinPairs $createdTeams 8
    $pastDates = @("2025-03-02","2025-03-16","2025-04-06","2025-04-20","2025-05-11","2025-05-25","2025-06-15","2025-07-06")
    for ($i = 0; $i -lt $pastPairs.Count; $i++) {
        $stadium = $createdStadiums[$stadiumIdx % $createdStadiums.Count]
        $stadiumIdx++
        $m = Add-MatchWithStats $pastPairs[$i].home $pastPairs[$i].away $seasonPast.id $stadium $pastDates[$i] $true $players
        $matches += $m
    }

    # Current season: played matches (before today) + upcoming matches (after today, not disputed)
    $currentPairs = New-RoundRobinPairs $createdTeams 14
    $currentDates = @(
        "2026-02-08","2026-02-22","2026-03-08","2026-03-22","2026-04-12","2026-04-26","2026-05-17",
        "2026-07-05","2026-07-19","2026-08-09","2026-08-23","2026-09-13","2026-09-27","2026-10-18"
    )
    for ($i = 0; $i -lt $currentPairs.Count; $i++) {
        $stadium = $createdStadiums[$stadiumIdx % $createdStadiums.Count]
        $stadiumIdx++
        $matchDate = $currentDates[$i]
        $disputed = ([datetime]$matchDate) -lt $today
        $m = Add-MatchWithStats $currentPairs[$i].home $currentPairs[$i].away $seasonCurrent.id $stadium $matchDate $disputed $players
        $matches += $m
    }
} else {
    Write-Host "Matches already exist, skipping match/stat generation."
}

Write-Host "Created matches: $($matches.Count)"
Write-Host "Seed script finished."
