#!/bin/bash
cd /home/ubuntu/shahn1
echo "Starting auto-update monitor..."
while true; do
    # جلب التحديثات من GitHub
    git fetch origin main
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u})

    if [ $LOCAL != $REMOTE ]; then
        echo "Changes detected! Updating project..."
        git pull origin main
        pnpm install
        # إعادة تشغيل عملية dev
        pkill -f "next dev"
        nohup pnpm dev > dev.log 2>&1 &
        echo "Project updated and restarted."
    fi
    sleep 60 # التحقق كل دقيقة
done
