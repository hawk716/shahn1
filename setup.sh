#!/bin/bash

# ألوان الطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  إعداد المشروع الشامل${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}خطأ: Node.js غير مثبت${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js موجود: $(node -v)${NC}\n"

# تشغيل سكريبت الإعداد
echo -e "${YELLOW}جاري الإعداد...${NC}\n"
node scripts/setup-vps.js

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ اكتمل الإعداد بنجاح!${NC}"
    echo -e "\n${BLUE}الخطوة التالية:${NC}"
    echo -e "${YELLOW}npm run dev${NC}  (للتطوير)"
    echo -e "${YELLOW}npm run build && npm start${NC}  (للإنتاج)"
else
    echo -e "\n${RED}✗ فشل الإعداد${NC}"
    exit 1
fi
