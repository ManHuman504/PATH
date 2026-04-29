REM Test Path# API

echo === PATH API TESTS ===

echo.
echo 1. Create Path
curl -X POST http://localhost:3000/api/command -H "Content-Type: application/json" -d "{\"type\":\"CREATE_PATH\",\"payload\":{\"title\":\"Learn TypeScript\"}}" 2>nul | find "success" >nul && echo SUCCESS || echo FAILED

echo.
echo 2. Get State
curl -X GET http://localhost:3000/api/state 2>nul | find "paths" >nul && echo SUCCESS || echo FAILED

echo.
echo === Tests Complete ===
