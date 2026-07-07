$ErrorActionPreference = 'SilentlyContinue'
$base = 'http://localhost:8080'

function Show($label, $method, $url, $body) {
    try {
        if ($body) {
            $r = Invoke-WebRequest -Uri $url -Method $method -Body $body -ContentType 'application/json' -UseBasicParsing
        } else {
            $r = Invoke-WebRequest -Uri $url -Method $method -UseBasicParsing
        }
        $code = $r.StatusCode
        $txt = [System.Text.Encoding]::UTF8.GetString($r.Content)
    } catch {
        $resp = $_.Exception.Response
        if ($resp) {
            $code = [int]$resp.StatusCode
            $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
            $txt = $sr.ReadToEnd()
        } else {
            $code = 'ERR'; $txt = $_.Exception.Message
        }
    }
    if ($txt.Length -gt 220) { $txt = $txt.Substring(0,220) }
    Write-Host "[$label] $method $url -> $code"
    Write-Host "   $txt"
}

Show 'health'          'GET'    "$base/actuator/health" $null
Show 'mongo-seed-list' 'GET'    "$base/api/v1/small-tests" $null
Show 'create-item-201' 'POST'   "$base/api/v1/small-items" '{"name":"widget","description":"a widget","quantity":5}'
Show 'list-items'      'GET'    "$base/api/v1/small-items" $null
Show 'get-item-1'      'GET'    "$base/api/v1/small-items/1" $null
Show 'unknown-404'     'GET'    "$base/api/v1/small-items/9999" $null
Show 'invalid-400'     'POST'   "$base/api/v1/small-items" '{"name":"","quantity":-3}'
Show 'duplicate-409'   'POST'   "$base/api/v1/small-items" '{"name":"widget","quantity":1}'
Show 'delete-item-200' 'DELETE' "$base/api/v1/small-items/1" $null
Show 'mongo-create'    'POST'   "$base/api/v1/small-tests" '{"name":"Grace","familyName":"Hopper","email":"grace@navy.mil","phone":"1906","attributes":{"rank":"admiral","bug":"moth"}}'
Show 'mongo-badEmail'  'POST'   "$base/api/v1/small-tests" '{"name":"X","email":"not-an-email"}'
Show 'mongo-emptyName' 'POST'   "$base/api/v1/small-tests" '{"name":"","email":"y@x.com"}'
Show 'favicon-quiet'   'GET'    "$base/favicon.ico" $null
