# Auto-commit script for Cafeteria project
# Run this script to automatically commit changes every 10 minutes

param(
    [int]$IntervalMinutes = 10,
    [string]$CommitMessage = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🚀 Starting auto-commit script..." -ForegroundColor Green
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "⏰ Commit interval: $IntervalMinutes minutes" -ForegroundColor Yellow
Write-Host "💬 Commit message: $CommitMessage" -ForegroundColor Magenta
Write-Host "Press Ctrl+C to stop the script" -ForegroundColor Red
Write-Host ""

# Function to commit changes
function Commit-Changes {
    try {
        # Check if there are any changes
        $status = git status --porcelain
        if ($status) {
            Write-Host "📝 Changes detected, committing..." -ForegroundColor Yellow
            
            # Add all changes
            git add .
            
            # Commit with timestamp
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $message = "Auto-commit: $timestamp - $CommitMessage"
            git commit -m $message
            
            Write-Host "✅ Committed successfully: $message" -ForegroundColor Green
            
            # Push to remote if configured
            $remote = git remote get-url origin 2>$null
            if ($remote) {
                Write-Host "🚀 Pushing to remote..." -ForegroundColor Cyan
                git push
                Write-Host "✅ Pushed successfully" -ForegroundColor Green
            } else {
                Write-Host "⚠️  No remote configured, skipping push" -ForegroundColor Yellow
            }
        } else {
            Write-Host "📭 No changes to commit" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Error during commit: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main loop
while ($true) {
    $currentTime = Get-Date -Format 'HH:mm:ss'
    Write-Host "[$currentTime] Checking for changes..." -ForegroundColor White
    
    Commit-Changes
    
    Write-Host "⏳ Waiting $IntervalMinutes minutes until next check..." -ForegroundColor Blue
    Write-Host "Next check at: $(Get-Date).AddMinutes($IntervalMinutes).ToString('HH:mm:ss')" -ForegroundColor Cyan
    Write-Host ""
    
    # Wait for specified interval
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}

Write-Host "🛑 Auto-commit script stopped" -ForegroundColor Red
