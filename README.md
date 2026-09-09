Rotten Noble Website Project

React FrontEnd
Apache PHP Backend
using Synology server

## ⚠️ `develop` 브랜치 = 자동 배포

`develop`에 push하면 NAS의 self-hosted GitHub Actions 러너가 즉시 감지해서
프런트/백엔드를 빌드하고 **실서비스(rotten-noble.com)에 자동 배포**한다
(`.github/workflows/deploy.yml`). 미완성/실험 중인 작업은 `develop`에 직접
올리지 말고 별도 브랜치에서 진행하다가, 배포할 준비가 됐을 때만
`develop`으로 머지할 것.