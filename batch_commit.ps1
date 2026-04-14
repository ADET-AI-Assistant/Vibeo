# Vibeo Multi-Repo Batch Commit Script
# This script commits changes across both the root and backend repositories

function Commit-Repo {
    param($Path, $Commits)
    if (Test-Path "$Path/.git") {
        Write-Host "--- Committing in $Path ---" -ForegroundColor Cyan
        Push-Location $Path
        foreach ($c in $Commits) {
            if (Test-Path $c.Path) {
                Write-Host "Committing $($c.Path)..." -ForegroundColor Green
                git add $c.Path
                git commit -m $c.Msg
            }
        }
        Pop-Location
    }
}

# Backend Commits
$backendCommits = @(
    @{ Path = "movies/admin.py"; Msg = "feat: register UserStat model in django admin" },
    @{ Path = "movies/views.py"; Msg = "refactor: optimize leaderboard and secure sync-stats view" },
    @{ Path = "movies/urls.py"; Msg = "build: remove insecure migration endpoint" },
    @{ Path = "vibeo_api/settings.py"; Msg = "config: add caching, logging, and pagination for production" },
    @{ Path = "vibeo_api/urls.py"; Msg = "refactor: implement API versioning (v1)" },
    @{ Path = "movies/tests.py"; Msg = "test: add comprehensive API integration tests" },
    @{ Path = "movies/__init__.py"; Msg = "chore: initialize movies app" },
    @{ Path = "build.sh"; Msg = "build: automate migrations in deployment script" }
)

# Root Commits
$rootCommits = @(
    @{ Path = "batch_commit.ps1"; Msg = "chore: add batch commit automation script" }
)

Commit-Repo "backend" $backendCommits
Commit-Repo "." $rootCommits

Write-Host "Multi-repo batch commits complete! Run 'git push' in both folders when ready." -ForegroundColor Cyan
