$env:BUILD_REPOSITORY_PROVIDER="TfsGit"

if(-not (Test-Path ".\set-env-secrets.ps1")) {
    $template = "" +
    "$env:SYSTEM_ACCESSTOKEN = `"<your-access-token>`""+
    "$env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI = `"<your-collection-uri>`"" +
    "$env:SYSTEM_TEAMPROJECT=`"<your-project>`"" +
    "$env:BUILD_REPOSITORY_NAME=`"<your-repository>`""
    Set-Content -Path ".\set-env-secrets.ps1" -Value $template

    throw "`"set-env-secrets.ps1`" generated, configure the required variables before running this script again."
}

.\set-env-secrets.ps1
