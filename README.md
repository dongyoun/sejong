# 하이퍼세븐 · HyperSeven

사람에게는 익숙하고, AI에게는 일하기 좋은 저작도구입니다. 맥과 윈도우에서 모든 기능을 무료로 씁니다.

- **하이퍼세븐 오피스**: 한글(HWP·HWPX)·워드(DOCX)·엑셀(XLSX)·파워포인트(PPTX)·PDF를 한 앱에서 받은 형식 그대로 열고, 고치고, 저장합니다.
- **하이퍼세븐 캐드**: DWG·SKP·3DM·IFC를 하나의 모델로 엽니다. 도면부터 3D·곡면·노드·BIM까지 한 흐름으로 이어집니다.

## AI 에이전트와 함께 쓰기 (MCP)

두 앱에는 MCP 서버와 명령줄이 들어 있어 따로 설치할 것이 없습니다. 에이전트는 파일을 통째로 다시 쓰지 않습니다. 구조를 먼저 읽고, 바꿀 문단·칸·요소만 고칩니다. 서식은 그 자리에 그대로 남습니다.

```sh
# 하이퍼세븐 오피스 (맥)
claude mcp add hyperseven -- "/Applications/HyperSeven Office.app/Contents/Resources/cli/hyperseven" mcp

# 하이퍼세븐 캐드 (맥)
claude mcp add hyperseven-cad -- "/Applications/HyperSeven CAD.app/Contents/MacOS/supercad" mcp
```

윈도우 명령은 앱 안에서 바로 복사할 수 있습니다. 오피스는 도구 › AI 연결 (MCP) 창, 캐드는 AI 탭의 '연결 방법'에 있습니다. 도구 목록과 쓰는 순서는 [llms.txt](https://hyperseven.pages.dev/llms.txt)와 [매뉴얼](https://hyperseven.pages.dev/manual.html#agents)에 있습니다.

## Using it with AI agents (MCP)

Both apps ship with an MCP server and a command line, so there is nothing extra to install. Instead of rewriting a whole file, an agent reads its structure first and then changes only the paragraphs, cells or elements it needs. Formatting stays where it was. Setup commands and the tool list are in [llms.txt](https://hyperseven.pages.dev/llms.txt).

## 바로 가기

- 홈페이지: https://hyperseven.pages.dev/
- 매뉴얼: https://hyperseven.pages.dev/manual.html
- 오피스 설치 파일: 이 저장소의 [Releases](../../releases)
- 버그 알리기: [Issues](../../issues)
- 문의: essay.archi@gmail.com
  - 회사·기관·단체에 맞춘 기능 조정이나 도입, 후원·투자 이야기도 편하게 보내 주세요.

이 저장소에는 오피스 설치 파일과 홈페이지 사본만 있습니다. 앱이 새 버전을 확인하는 안내문(latest.json)도 이 저장소의 GitHub Pages 에 함께 둡니다.

본 제품은 한글과컴퓨터의 한글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다. ‘한글’과 ‘HWP’는 한글과컴퓨터의 상표이며, 하이퍼세븐은 한글과컴퓨터와 관계가 없습니다.

© 2026 히스테리시스 (HYSTERESIS) · 하이퍼세븐은 히스테리시스의 제품입니다.
