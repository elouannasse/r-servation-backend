@echo off
echo Starting NestJS application...
start /B npm run start:dev

echo Waiting for application to start...
timeout /t 15 /nobreak > nul

echo Running Artillery performance test...
artillery run artillery-config.yml

echo Performance test completed.
pause