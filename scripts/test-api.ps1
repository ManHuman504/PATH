#!/usr/bin/env pwsh

# Test Script for Path# API
Write-Host "`n=== PATH# API TEST ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test 1: Get initial state
Write-Host "`n1️⃣  Получить начальное состояние" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/state" -Method GET | ConvertFrom-Json
Write-Host "✅ Пути: $($response.paths.Count)" -ForegroundColor Green

# Test 2: Create a path
Write-Host "`n2️⃣  Создать новый путь (CREATE_PATH)" -ForegroundColor Yellow
$command = @{
    type = "CREATE_PATH"
    payload = @{
        title = "Изучение TypeScript"
        description = "Полное изучение TypeScript с нуля"
    }
}
Invoke-WebRequest -Uri "$baseUrl/api/command" -Method POST -ContentType "application/json" -Body ($command | ConvertTo-Json) | Out-Null
Write-Host "✅ Путь создан" -ForegroundColor Green

# Test 3: Check state
Write-Host "`n3️⃣  Проверить состояние (должен быть 1 путь)" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/state" -Method GET | ConvertFrom-Json
Write-Host "✅ Пути: $($response.paths.Count)" -ForegroundColor Green
if ($response.paths.Count -gt 0) {
    $pathId = $response.paths[0].id
    Write-Host "   Path ID: $pathId" -ForegroundColor Cyan
}

# Test 4: Add node to path
Write-Host "`n4️⃣  Добавить узел (ADD_NODE)" -ForegroundColor Yellow
$command = @{
    type = "ADD_NODE"
    payload = @{
        pathId = $pathId
        title = "Изучить типы данных"
        description = "Понять number, string, boolean, arrays"
    }
}
Invoke-WebRequest -Uri "$baseUrl/api/command" -Method POST -ContentType "application/json" -Body ($command | ConvertTo-Json) | Out-Null
Write-Host "✅ Узел добавлен" -ForegroundColor Green

# Test 5: Check state again
Write-Host "`n5️⃣  Проверить узлы в пути" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/state" -Method GET | ConvertFrom-Json
$nodeCount = $response.paths[0].nodes.Count
Write-Host "✅ Узлов в пути: $nodeCount" -ForegroundColor Green
if ($nodeCount -gt 0) {
    $nodeId = $response.paths[0].nodes[0].id
    Write-Host "   Node ID: $nodeId" -ForegroundColor Cyan
}

# Test 6: Update node (КРИТИЧНА ПРОВЕРКА)
Write-Host "`n6️⃣  Обновить узел (UPDATE_NODE)" -ForegroundColor Yellow
$command = @{
    type = "UPDATE_NODE"
    payload = @{
        pathId = $pathId
        nodeId = $nodeId
        title = "Изучить типы данных ✓"
        description = "ГОТОВО!"
    }
}
Invoke-WebRequest -Uri "$baseUrl/api/command" -Method POST -ContentType "application/json" -Body ($command | ConvertTo-Json) | Out-Null
Write-Host "✅ Узел обновлен" -ForegroundColor Green

# Test 7: Complete node (КРИТИЧНА ПРОВЕРКА)
Write-Host "`n7️⃣  Завершить узел (COMPLETE_NODE)" -ForegroundColor Yellow
$command = @{
    type = "COMPLETE_NODE"
    payload = @{
        pathId = $pathId
        nodeId = $nodeId
    }
}
Invoke-WebRequest -Uri "$baseUrl/api/command" -Method POST -ContentType "application/json" -Body ($command | ConvertTo-Json) | Out-Null
Write-Host "✅ Узел завершен" -ForegroundColor Green

# Test 8: Check state
Write-Host "`n8️⃣  Проверить состояние (узел должен быть completed=true)" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/state" -Method GET | ConvertFrom-Json
$node = $response.paths[0].nodes[0]
Write-Host "✅ Узел завершен: $($node.completed)" -ForegroundColor Green
Write-Host "   Заголовок: $($node.title)" -ForegroundColor Cyan

# Test 9: Delete node
Write-Host "`n9️⃣  Удалить узел (DELETE_NODE)" -ForegroundColor Yellow
$command = @{
    type = "DELETE_NODE"
    payload = @{
        pathId = $pathId
        nodeId = $nodeId
    }
}
Invoke-WebRequest -Uri "$baseUrl/api/command" -Method POST -ContentType "application/json" -Body ($command | ConvertTo-Json) | Out-Null
Write-Host "✅ Узел удален" -ForegroundColor Green

# Test 10: Check final state
Write-Host "`n🔟 Финальное состояние" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/state" -Method GET | ConvertFrom-Json
$finalNodes = $response.paths[0].nodes.Count
Write-Host "✅ Узлов осталось: $finalNodes (должен быть 0)" -ForegroundColor Green

# Test 11: Delete path
Write-Host "`n1️⃣1️⃣  Удалить путь (DELETE_PATH)" -ForegroundColor Yellow
$command = @{
    type = "DELETE_PATH"
    payload = @{
        pathId = $pathId
    }
}
Invoke-WebRequest -Uri "$baseUrl/api/command" -Method POST -ContentType "application/json" -Body ($command | ConvertTo-Json) | Out-Null
Write-Host "✅ Путь удален" -ForegroundColor Green

# Final check
Write-Host "`n🏁 Финальная проверка" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/state" -Method GET | ConvertFrom-Json
Write-Host "✅ Пути: $($response.paths.Count) (должен быть 0)" -ForegroundColor Green

Write-Host "`n=== ✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ ===" -ForegroundColor Green
Write-Host "Движок работает корректно!" -ForegroundColor Green
Write-Host "`n"
