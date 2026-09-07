#!/usr/bin/env bash
# ==============================================================================
# Vijay Jewellery Collection - Production VPS Deployment Script
# Target Domain: https://vijayjewellery.shonku.site
# ==============================================================================

set -e

GREEN='\033[0;32m'
GOLD='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GOLD}======================================================${NC}"
echo -e "${GOLD}   Deploying Vijay Jewellery Collection to Production${NC}"
echo -e "${GOLD}   Domain: https://vijayjewellery.shonku.site${NC}"
echo -e "${GOLD}======================================================${NC}"

# 1. Verify Docker Installation
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker is not installed on this VPS.${NC}"
    echo "Install it quickly via: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 2. Verify Docker Compose
if ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Docker Compose plugin is not installed.${NC}"
    echo "Install it via: sudo apt-get install -y docker-compose-plugin"
    exit 1
fi

# 3. Ensure .env file exists
if [ ! -f .env ]; then
    if [ -f deploy.env.example ]; then
        echo -e "${GOLD}[INFO] Creating .env from deploy.env.example...${NC}"
        cp deploy.env.example .env
        echo -e "${GREEN}✓ Created .env file.${NC}"
    else
        echo -e "${RED}[ERROR] No .env file found. Please create one with your R2 & database credentials.${NC}"
        exit 1
    fi
fi

# 4. Prepare Persistent Storage Directories
echo -e "${GOLD}[INFO] Setting up persistent storage permissions...${NC}"
mkdir -p ./prisma
mkdir -p ./app/data
chmod -R 777 ./prisma

# 5. Build and Launch Containers
echo -e "${GOLD}[INFO] Building and starting Docker containers...${NC}"
docker compose up -d --build --remove-orphans

# 6. Clean dangling images to conserve VPS disk space
echo -e "${GOLD}[INFO] Cleaning up dangling docker images...${NC}"
docker image prune -f >/dev/null 2>&1 || true

# 7. Host Nginx Integration (if host Nginx is active)
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet nginx; then
    echo -e "${GOLD}[INFO] Host Nginx is active on this VPS.${NC}"
    if [ ! -f /etc/nginx/sites-available/vijayjewellery.conf ]; then
        echo -e "${GOLD}[INFO] Setting up Nginx reverse proxy to port 3080...${NC}"
        cp ./nginx.conf.example /etc/nginx/sites-available/vijayjewellery.conf 2>/dev/null || true
        ln -sf /etc/nginx/sites-available/vijayjewellery.conf /etc/nginx/sites-enabled/ 2>/dev/null || true
        if nginx -t >/dev/null 2>&1; then
            systemctl reload nginx
            echo -e "${GREEN}✓ Host Nginx configured and reloaded for vijayjewellery.shonku.site!${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}✓ Vijay Jewellery Container Running on 127.0.0.1:3080!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo ""
docker compose ps
echo ""
echo -e "${GOLD}Nginx & SSL Configuration (if not done yet):${NC}"
echo "  1. sudo cp nginx.conf.example /etc/nginx/sites-available/vijayjewellery.conf"
echo "  2. sudo ln -sf /etc/nginx/sites-available/vijayjewellery.conf /etc/nginx/sites-enabled/"
echo "  3. sudo nginx -t && sudo systemctl reload nginx"
echo "  4. sudo certbot --nginx -d vijayjewellery.shonku.site"
echo ""
echo -e "Access your store at:"
echo -e "${GREEN}👉 https://vijayjewellery.shonku.site${NC}"
echo -e "${GREEN}👉 https://vijayjewellery.shonku.site/admin${NC}"

