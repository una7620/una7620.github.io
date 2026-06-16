# LEE YUNA | Web Security Portfolio

> 취약점을 찾고, 더 안전한 웹을 만듭니다.

🔗 **배포 주소**: [una7620.github.io](https://una7620.github.io)

---

## 프로젝트 소개

수원대학교 정보보호학과 4학년 이유나의 개인 포트폴리오 사이트입니다.
웹 보안을 목표로 쌓아온 역량과 프로젝트를 시각적으로 표현했습니다.

---

## 사용 기술

| 분류 | 기술 |
|------|------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| 애니메이션 | GSAP 3, Canvas API, SVG |
| 외부 API | GitHub REST API |
| 배포 | GitHub Pages |

---

## 주요 기능

### 🌙 로딩 화면
- LEE YUNA 글씨가 둥둥 떠다니는 float 애니메이션
- 클릭 시 메인 화면으로 부드럽게 전환

### ✦ 메인 화면
- Canvas API로 구현한 보라색 별 반짝임 효과
- 기술 스택 태그가 화면 안에서 둥둥 떠다니는 효과

### 📜 Skills 섹션
- 스크롤에 따라 SVG 선이 그어지는 path 드로잉 애니메이션
- 선이 지나갈 때 스킬 항목과 별이 등장하는 효과
- 산 이미지 뒤로 선이 사라지는 레이어 효과

### 💼 Projects 섹션
- GitHub REST API를 활용한 레포지토리 자동 연동
- 새 프로젝트 업로드 시 자동으로 반영 (MVC 구조)
- 좌우 슬라이더로 프로젝트 탐색

---

## MVC 구조 설명

```
Model      → GitHub API에서 받아온 레포지토리 JSON 데이터
View       → renderProjectCards() 함수가 카드 HTML 생성
Controller → loadGithubProjects() 함수가 데이터 받아서 View에 전달
```

GitHub에 새 레포지토리를 추가하면 포트폴리오에 자동으로 반영됩니다.

---

## 구현 포인트

- `strokeDasharray` / `strokeDashoffset` 을 활용한 SVG 선 드로잉
- `Canvas API` 로 별 반짝임 구현 (requestAnimationFrame)
- `GSAP` 으로 스크롤 연동 애니메이션 구현
- `GitHub REST API` fetch로 레포지토리 데이터 파싱
- `preserveAspectRatio="none"` 으로 SVG 반응형 처리

---

## 폴더 구조

```
una7620.github.io/
├── index.html       # 메인 HTML
├── style.css        # 전체 스타일
├── main.js          # 애니메이션 및 GitHub API 로직
├── star.png         # 달 이미지
├── mountain1.png    # 배경 산 이미지 (왼쪽)
├── mountain2.png    # 배경 산 이미지 (오른쪽)
├── main.mp4         # 메인 배경 영상
└── grid.mp4         # 로딩 배경 영상
```

---

## 개발자

**이유나** · 수원대학교 정보보호학과 4학년  
📧 eueu0815@naver.com  
🔗 [github.com/una7620](https://github.com/una7620)
