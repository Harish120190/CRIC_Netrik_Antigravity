@echo off
echo Starting Build Process (Monorepo)...

REM 1. Frontend Build
echo -----------------------------------
echo Building Frontend...
call npm ci --legacy-peer-deps
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

REM 2. Backend Build
echo -----------------------------------
echo Building Backend...
cd server
call npm ci --legacy-peer-deps
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo -----------------------------------
echo Build Successful!
echo To start the server, run: cd server ^&^& npm run start:prod
